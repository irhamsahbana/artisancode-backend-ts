import { AppError } from '@/common/app_error'

import { EnrollmentUsecaseDeps } from '../enrollment.usecase'

export async function deleteEnrollment(
  deps: EnrollmentUsecaseDeps,
  id: string,
  companyId: string,
): Promise<void> {
  const enrollment = await deps.repo.findById(id, companyId)
  if (!enrollment) {
    throw new AppError(404, 'Enrollment not found')
  }
  const activeInvoice = await deps.invoiceUsecase.findActiveByEnrollment(id, companyId)
  if (activeInvoice) {
    throw new AppError(400, 'Cannot delete enrollment with active invoice')
  }
  return deps.repo.delete(id, companyId)
}
