import { AppError, ErrorCode } from '@/common/packages/types'

import { EnrollmentUsecaseDeps } from '../enrollment.usecase'

export async function deleteEnrollment(
  deps: EnrollmentUsecaseDeps,
  id: string,
  companyId: string,
): Promise<void> {
  const enrollment = await deps.repo.findById(id, companyId)
  if (!enrollment) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Enrollment not found')
  }
  const activeInvoice = await deps.invoiceUsecase.findActiveByEnrollment(id, companyId)
  if (activeInvoice) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, 'Cannot delete enrollment with active invoice')
  }
  return deps.repo.delete(id, companyId)
}
