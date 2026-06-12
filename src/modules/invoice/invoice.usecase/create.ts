import { AppError } from '@/common/app_error'
import { CreateInvoiceReq, Invoice } from '@/entities/invoice.entity'

import { InvoiceUsecaseDeps } from '../invoice.usecase'

export async function createInvoice(
  deps: InvoiceUsecaseDeps,
  data: CreateInvoiceReq,
): Promise<Invoice> {
  const activeInvoice = await deps.repo.findActiveByEnrollment(
    data.enrollment_id,
    data.company_id,
  )
  if (activeInvoice) {
    throw new AppError(400, 'Active invoice already exists for this enrollment')
  }
  const invoice = await deps.repo.create(data)
  return deps.generatePaymentLink(invoice.id, data.company_id)
}
