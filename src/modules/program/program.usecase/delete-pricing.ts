import { AppError } from '@/common/app_error'

import { ProgramUsecaseDeps } from '../program.usecase'

export async function deletePricing(
  deps: ProgramUsecaseDeps,
  programId: string,
  pricingId: string,
  companyId: string,
): Promise<void> {
  const program = await deps.repo.findById(programId, companyId)
  if (!program) {
    throw new AppError(404, 'Program not found')
  }

  const pricing = program.pricings?.find((p) => p.id === pricingId)
  if (!pricing) {
    throw new AppError(404, 'Pricing package not found')
  }

  const activeEnrollments = await deps.enrollmentRepo.countActiveByPricing(pricingId, companyId)
  if (activeEnrollments > 0) {
    throw new AppError(
      409,
      `Cannot delete pricing package. There are ${activeEnrollments} active enrollments using it.`,
    )
  }

  return deps.repo.deletePricing(programId, pricingId, companyId)
}
