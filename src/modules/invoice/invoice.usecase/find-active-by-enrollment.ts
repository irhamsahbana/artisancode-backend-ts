import { Invoice } from '@/entities/invoice.entity'

import { InvoiceUsecaseDeps } from '../invoice.usecase'

export async function findActiveInvoiceByEnrollment(
  deps: InvoiceUsecaseDeps,
  enrollmentId: string,
  companyId: string,
): Promise<Invoice | null> {
  return deps.repo.findActiveByEnrollment(enrollmentId, companyId)
}
