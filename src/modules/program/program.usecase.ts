import { AppError } from '@/common/app_error'
import * as Entity from '@/entities/program.entity'
import { IBranchRepo } from '@/modules/branch/branch.contract'
import { ICategoryRepo } from '@/modules/category/category.contract'

import { IProgramRepo, IProgramUsecase } from './program.contract'

export default class ProgramUsecase implements IProgramUsecase {
  constructor(
    private repo: IProgramRepo,
    private branchRepo: IBranchRepo,
    private categoryRepo: ICategoryRepo,
  ) {}

  async create(req: Entity.CreateProgramReq): Promise<Entity.Program> {
    if (req.branch_id) {
      const branch = await this.branchRepo.findById(req.branch_id, req.company_id)
      if (!branch) {
        throw new AppError(404, 'Branch not found')
      }
    }

    if (req.age_category_id) {
      const category = await this.categoryRepo.findById(req.age_category_id, req.company_id)
      if (!category) {
        throw new AppError(404, 'Age category not found')
      }
    }

    return this.repo.create(req)
  }

  async update(req: Entity.UpdateProgramReq): Promise<Entity.Program> {
    const program = await this.repo.findById(req.id, req.company_id)
    if (!program) {
      throw new AppError(404, 'Program not found')
    }

    if (req.branch_id) {
      const branch = await this.branchRepo.findById(req.branch_id, req.company_id)
      if (!branch) {
        throw new AppError(404, 'Branch not found')
      }
    }

    if (req.age_category_id) {
      const category = await this.categoryRepo.findById(req.age_category_id, req.company_id)
      if (!category) {
        throw new AppError(404, 'Age category not found')
      }
    }

    return this.repo.update(req)
  }

  async delete(id: string, companyId: string): Promise<void> {
    const program = await this.repo.findById(id, companyId)
    if (!program) {
      throw new AppError(404, 'Program not found')
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
    return this.repo.addPricing(req)
  }
}
