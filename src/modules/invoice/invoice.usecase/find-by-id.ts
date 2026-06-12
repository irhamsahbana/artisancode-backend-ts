import { AppError } from '@/common/app_error'
import { Invoice } from '@/entities/invoice.entity'

import { InvoiceUsecaseDeps } from '../invoice.usecase'

export async function findInvoiceById(
  deps: InvoiceUsecaseDeps,
  id: string,
  companyId: string,
): Promise<Invoice> {
  const invoice = await deps.repo.findById(id, companyId)
  if (!invoice) throw new AppError(404, 'Invoice not found')
  return invoice
}
