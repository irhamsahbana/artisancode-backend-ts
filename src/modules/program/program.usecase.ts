import { AppError } from '@/common/app_error'
import { withSpan } from '@/common/packages/observability'
import { IBranchRepo } from '@/contracts/branch.contract'
import { IEnrollmentRepo } from '@/contracts/enrollment.contract'
import { IProgramRepo, IProgramUsecase } from '@/contracts/program.contract'

import { addPrice } from './program.usecase/add-price'
import { addPricing } from './program.usecase/add-pricing'
import { addSchedule } from './program.usecase/add-schedule'
import { createProgram } from './program.usecase/create'
import { deleteProgram } from './program.usecase/delete'
import { deletePricing } from './program.usecase/delete-pricing'
import { deleteSchedule } from './program.usecase/delete-schedule'
import { findProgramById } from './program.usecase/find-by-id'
import { findProgramList } from './program.usecase/find-list'
import { updateProgram } from './program.usecase/update'
import { updateAllProgram } from './program.usecase/update-all'
import { updatePrice } from './program.usecase/update-price'

export interface ProgramUsecaseDeps {
  repo: IProgramRepo
  branchRepo: IBranchRepo
  enrollmentRepo: IEnrollmentRepo
  checkOverlap: (
    current: { start: Date; end: Date | null },
    existing: { start: Date; end: Date | null; id: string },
    currency: string,
  ) => void
  validatePricingOverlap: (
    existingPricings: import('@/entities/program.entity').ProgramPricing[],
    newPrices: import('@/entities/program.entity').ProgramPrice[],
  ) => void
}

function checkOverlap(
  current: { start: Date; end: Date | null },
  existing: { start: Date; end: Date | null; id: string },
  currency: string,
) {
  const startA = current.start
  const endA = current.end
  const startB = existing.start
  const endB = existing.end

  const isStartABeforeEndB = endB === null || startA < endB
  const isEndAAfterStartB = endA === null || endA > startB

  if (isStartABeforeEndB && isEndAAfterStartB) {
    throw new AppError(
      409,
      `Date overlap detected with another price (ID: ${existing.id}) for currency ${currency}.`,
    )
  }
}

function validatePricingOverlap(
  existingPricings: import('@/entities/program.entity').ProgramPricing[],
  newPrices: import('@/entities/program.entity').ProgramPrice[],
) {
  const allExistingPrices = existingPricings.flatMap((p) => p.prices || [])

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

export function createProgramUsecase(
  repo: IProgramRepo,
  branchRepo: IBranchRepo,
  enrollmentRepo: IEnrollmentRepo,
): IProgramUsecase {
  const deps: ProgramUsecaseDeps = { repo, branchRepo, enrollmentRepo, checkOverlap, validatePricingOverlap }

  return {
    create: (req) =>
      withSpan('ProgramUsecase.create', () => createProgram(deps, req)),
    update: (req) =>
      withSpan('ProgramUsecase.update', () => updateProgram(deps, req)),
    updateAll: (req) =>
      withSpan('ProgramUsecase.updateAll', () => updateAllProgram(deps, req)),
    delete: (id, companyId) => deleteProgram(deps, id, companyId),
    findById: (id, companyId) => findProgramById(deps, id, companyId),
    findList: (req) => findProgramList(deps, req),
    addSchedule: (req) =>
      withSpan('ProgramUsecase.addSchedule', () => addSchedule(deps, req)),
    addPricing: (req) =>
      withSpan('ProgramUsecase.addPricing', () => addPricing(deps, req)),
    addPrice: (req) =>
      withSpan('ProgramUsecase.addPrice', () => addPrice(deps, req)),
    updatePrice: (req) =>
      withSpan('ProgramUsecase.updatePrice', () => updatePrice(deps, req)),
    deleteSchedule: (programId, scheduleId, companyId) =>
      withSpan('ProgramUsecase.deleteSchedule', () =>
        deleteSchedule(deps, programId, scheduleId, companyId)),
    deletePricing: (programId, pricingId, companyId) =>
      withSpan('ProgramUsecase.deletePricing', () =>
        deletePricing(deps, programId, pricingId, companyId)),
  }
}

export default createProgramUsecase
