import { AppError, ErrorCode } from '@/common/packages/types'
import { Invoice } from '@/entities/invoice.entity'

import { InvoiceUsecaseDeps } from '../invoice.usecase'

export async function updateInvoiceStatus(
  deps: InvoiceUsecaseDeps,
  id: string,
  companyId: string,
  status: string,
): Promise<Invoice> {
  const invoice = await deps.repo.findById(id, companyId)
  if (!invoice) throw new AppError(ErrorCode.NOT_FOUND, 'Invoice not found')

  return deps.repo.update({
    id,
    company_id: companyId,
    status,
  })
}
