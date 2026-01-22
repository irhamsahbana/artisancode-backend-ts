import { AppError } from '@/common/app_error'
import * as Entity from '@/entities/program.entity'
import { IBranchRepo } from '@/modules/branch/branch.contract'
import { IEnrollmentRepo } from '@/modules/enrollment/enrollment.contract'

import { IProgramRepo, IProgramUsecase } from './program.contract'

export default class ProgramUsecase implements IProgramUsecase {
  constructor(
    private repo: IProgramRepo,
    private branchRepo: IBranchRepo,
    private enrollmentRepo: IEnrollmentRepo,
  ) {}

  async create(req: Entity.CreateProgramReq): Promise<Entity.Program> {
    if (req.branch_id) {
      const branch = await this.branchRepo.findById(req.branch_id, req.company_id)
      if (!branch) {
        throw new AppError(404, 'Branch not found')
      }
    }

    // Check duplicated name
    const existingProgram = await this.repo.findByName(
      req.name,
      req.company_id,
      req.branch_id || null,
    )
    if (existingProgram) {
      throw new AppError(409, 'Program with this name already exists')
    }

    // Validate pricing overlap if pricings are provided
    if (req.pricings) {
      // Since we are creating a new program, there are no "existing" pricings in DB yet.
      // We only need to check overlap WITHIN the request payload itself.
      for (const pricing of req.pricings) {
        this.validatePricingOverlap(
          [],
          pricing.prices.map((p) => ({
            ...p,
            id: '',
            pricing_id: '',
            started_at: p.started_at || new Date(),
            ended_at: p.ended_at || null,
            created_at: new Date(),
          })),
        )
      }
    }

    return this.repo.create(req)
  }

  async update(req: Entity.UpdateProgramReq): Promise<Entity.Program> {
    const program = await this.repo.findById(req.id, req.company_id)
    if (!program) {
      throw new AppError(404, 'Program not found')
    }

    if (req.name && req.name !== program.name) {
      // Check duplicated name
      const existingProgram = await this.repo.findByName(
        req.name,
        req.company_id,
        req.branch_id || program.branch_id,
      )
      if (existingProgram && existingProgram.id !== req.id) {
        throw new AppError(409, 'Program with this name already exists')
      }
    }

    if (req.branch_id) {
      const branch = await this.branchRepo.findById(req.branch_id, req.company_id)
      if (!branch) {
        throw new AppError(404, 'Branch not found')
      }
    }

    return this.repo.update(req)
  }

  async updateAll(req: Entity.UpdateProgramAllReq): Promise<Entity.Program> {
    const program = await this.repo.findById(req.id, req.company_id)
    if (!program) {
      throw new AppError(404, 'Program not found')
    }

    if (req.branch_id !== undefined && req.branch_id !== null) {
      const branch = await this.branchRepo.findById(req.branch_id, req.company_id)
      if (!branch) {
        throw new AppError(404, 'Branch not found')
      }
    }

    if (req.name && req.name !== program.name) {
      const existingProgram = await this.repo.findByName(
        req.name,
        req.company_id,
        req.branch_id !== undefined ? req.branch_id : program.branch_id,
      )
      if (existingProgram && existingProgram.id !== req.id) {
        throw new AppError(409, 'Program with this name already exists')
      }
    }

    if (req.pricings) {
      for (const pricing of req.pricings) {
        this.validatePricingOverlap(
          [],
          pricing.prices.map((p) => ({
            ...p,
            id: '',
            pricing_id: '',
            started_at: p.started_at || new Date(),
            ended_at: p.ended_at || null,
            created_at: new Date(),
          })),
        )
      }
    }

    return this.repo.updateAll(req)
  }

  async delete(id: string, companyId: string): Promise<void> {
    const program = await this.repo.findById(id, companyId)
    if (!program) {
      throw new AppError(404, 'Program not found')
    }

    // Check active enrollments
    const activeEnrollments = await this.enrollmentRepo.countActiveByProgram(id, companyId)
    if (activeEnrollments > 0) {
      throw new AppError(
        409,
        `Cannot delete program. There are ${activeEnrollments} active enrollments.`,
      )
    }

    return this.repo.delete(id, companyId)
  }

  async findById(id: string, companyId: string): Promise<Entity.Program | null> {
    return this.repo.findById(id, companyId)
  }

  async findList(req: Entity.GetProgramReq): Promise<Entity.ProgramList> {
    return this.repo.findList(req)
  }

  async addSchedule(req: Entity.AddScheduleReq): Promise<Entity.ProgramSchedule> {
    const program = await this.repo.findById(req.program_id, req.company_id)
    if (!program) {
      throw new AppError(404, 'Program not found')
    }
    return this.repo.addSchedule(req)
  }

  async addPricing(req: Entity.AddPricingReq): Promise<Entity.ProgramPricing> {
    const program = await this.repo.findById(req.program_id, req.company_id)
    if (!program) {
      throw new AppError(404, 'Program not found')
    }

    // Check duplicated pricing name
    const existingPricingName = program.pricings?.find(
      (p) => p.name.toLowerCase() === req.name.toLowerCase(),
    )
    if (existingPricingName) {
      throw new AppError(409, 'Pricing package with this name already exists')
    }

    // Validate pricing overlap
    // Pass empty array for existing pricings because we allow different pricing packages
    // to have overlapping currencies/dates (e.g. Basic vs Premium).
    this.validatePricingOverlap(
      [],
      req.prices.map((p) => ({
        ...p,
        id: '',
        pricing_id: '',
        started_at: p.started_at || new Date(),
        ended_at: p.ended_at || null,
        created_at: new Date(),
        updated_at: new Date(),
      })),
    )

    return this.repo.addPricing(req)
  }

  async addPrice(req: Entity.AddPriceReq): Promise<Entity.ProgramPrice> {
    const program = await this.repo.findById(req.program_id, req.company_id)
    if (!program) {
      throw new AppError(404, 'Program not found')
    }

    const pricing = program.pricings?.find((p) => p.id === req.pricing_id)
    if (!pricing) {
      throw new AppError(404, 'Pricing package not found')
    }

    const newStart = req.started_at ? new Date(req.started_at) : new Date()
    const newEnd = req.ended_at ? new Date(req.ended_at) : null

    // 1. Auto-Cutoff Logic:
    // Find active price for same currency that has NO end date (open-ended)
    // and close it at the new start date.
    const openEndedPrice = pricing.prices.find(
      (p) =>
        p.currency === req.currency &&
        p.ended_at === null &&
        new Date(p.started_at) < newStart,
    )

    if (openEndedPrice) {
      // Close the previous price
      await this.repo.updatePrice({
        program_id: req.program_id,
        pricing_id: req.pricing_id,
        price_id: openEndedPrice.id,
        company_id: req.company_id,
        ended_at: newStart,
      })
      // Update local object for overlap check below
      openEndedPrice.ended_at = newStart
    }

    // 2. Validate Overlap with ALL other prices (including the just-closed one)
    const otherPrices = pricing.prices.filter((p) => p.currency === req.currency)

    for (const other of otherPrices) {
      this.checkOverlap(
        { start: newStart, end: newEnd },
        {
          start: new Date(other.started_at),
          end: other.ended_at ? new Date(other.ended_at) : null,
          id: other.id,
        },
        req.currency,
      )
    }

    return this.repo.addPrice(req)
  }

  async updatePrice(req: Entity.UpdatePriceReq): Promise<Entity.ProgramPrice> {
    const program = await this.repo.findById(req.program_id, req.company_id)
    if (!program) {
      throw new AppError(404, 'Program not found')
    }

    const pricing = program.pricings?.find((p) => p.id === req.pricing_id)
    if (!pricing) {
      throw new AppError(404, 'Pricing package not found')
    }

    const price = pricing.prices.find((p) => p.id === req.price_id)
    if (!price) {
      throw new AppError(404, 'Price not found')
    }

    // 1. Determine the effective start and end dates
    const effectiveStartedAt = req.started_at
      ? new Date(req.started_at)
      : new Date(price.started_at)
    // For ended_at:
    // If req.ended_at is explicitly null => it becomes null (infinite)
    // If req.ended_at is undefined => use existing price.ended_at
    // If req.ended_at is a date => use that date
    let effectiveEndedAt: Date | null
    if (req.ended_at === null) {
      effectiveEndedAt = null
    } else if (req.ended_at === undefined) {
      effectiveEndedAt = price.ended_at ? new Date(price.ended_at) : null
    } else {
      effectiveEndedAt = new Date(req.ended_at)
    }

    // 2. Validate Date Logic (Start must be before End)
    if (effectiveEndedAt && effectiveStartedAt > effectiveEndedAt) {
      throw new AppError(400, 'Start date cannot be after end date')
    }

    // 3. Overlap Check
    // Get all OTHER prices for the SAME currency in this pricing package
    const otherPrices = pricing.prices.filter(
      (p) => p.id !== req.price_id && p.currency === price.currency,
    )

    for (const other of otherPrices) {
      this.checkOverlap(
        { start: effectiveStartedAt, end: effectiveEndedAt },
        {
          start: new Date(other.started_at),
          end: other.ended_at ? new Date(other.ended_at) : null,
          id: other.id,
        },
        price.currency,
      )
    }

    return this.repo.updatePrice(req)
  }

  private checkOverlap(
    current: { start: Date; end: Date | null },
    existing: { start: Date; end: Date | null; id: string },
    currency: string,
  ) {
    const startA = current.start
    const endA = current.end
    const startB = existing.start
    const endB = existing.end

    // Overlap Logic:
    // Two ranges [StartA, EndA] and [StartB, EndB] overlap if:
    // (StartA < EndB) AND (EndA > StartB)
    // Handling nulls (infinity):
    // - If EndA is null, it overlaps if EndB > StartA (or EndB is null)
    // - If EndB is null, it overlaps if EndA > StartB (or EndA is null)

    const isStartABeforeEndB = endB === null || startA < endB
    const isEndAAfterStartB = endA === null || endA > startB

    if (isStartABeforeEndB && isEndAAfterStartB) {
      throw new AppError(
        409,
        `Date overlap detected with another price (ID: ${existing.id}) for currency ${currency}.`,
      )
    }
  }

  async deleteSchedule(programId: string, scheduleId: string, companyId: string): Promise<void> {
    const program = await this.repo.findById(programId, companyId)
    if (!program) {
      throw new AppError(404, 'Program not found')
    }

    const schedule = program.schedules?.find((s) => s.id === scheduleId)
    if (!schedule) {
      throw new AppError(404, 'Schedule not found')
    }

    return this.repo.deleteSchedule(programId, scheduleId, companyId)
  }

  async deletePricing(programId: string, pricingId: string, companyId: string): Promise<void> {
    const program = await this.repo.findById(programId, companyId)
    if (!program) {
      throw new AppError(404, 'Program not found')
    }

    const pricing = program.pricings?.find((p) => p.id === pricingId)
    if (!pricing) {
      throw new AppError(404, 'Pricing package not found')
    }

    // Check active enrollments
    const activeEnrollments = await this.enrollmentRepo.countActiveByPricing(pricingId, companyId)
    if (activeEnrollments > 0) {
      throw new AppError(
        409,
        `Cannot delete pricing package. There are ${activeEnrollments} active enrollments using it.`,
      )
    }

    return this.repo.deletePricing(programId, pricingId, companyId)
  }

  private validatePricingOverlap(
    existingPricings: Entity.ProgramPricing[],
    newPrices: Entity.ProgramPrice[],
  ) {
    // Collect all active prices including new ones
    // Check if any currency has overlapping active dates
    // Simplified: Check if there is already an active price for the same currency with no end date
    // or if the dates overlap.

    // For now, let's implement a simpler rule:
    // A currency cannot have multiple prices active at the same time
    // and overlapping dates.

    // Note: The new prices are part of a NEW pricing package.
    // However, existing logic seems to structure pricing as packages containing prices.

    // If the requirement is "Active Pricing Overlap", we need to check against ALL active prices of the program.

    // Strategy:
    // 1. Flatten all existing prices
    // 2. For each new price, check against flattened list

    const allExistingPrices = existingPricings
      .flatMap((p) => p.prices || [])

    for (const newPrice of newPrices) {
      const newStart = newPrice.started_at
        ? new Date(newPrice.started_at).getTime()
        : new Date().getTime()
      const newEnd = newPrice.ended_at ? new Date(newPrice.ended_at).getTime() : Infinity

      const overlap = allExistingPrices.find((existing) => {
        if (existing.currency !== newPrice.currency) return false

        const existStart = existing.started_at ? new Date(existing.started_at).getTime() : 0
        const existEnd = existing.ended_at ? new Date(existing.ended_at).getTime() : Infinity

        return Math.max(newStart, existStart) < Math.min(newEnd, existEnd)
      })

      if (overlap) {
        throw new AppError(409, `Price overlap detected for currency ${newPrice.currency}.`)
      }
    }
  }
}
