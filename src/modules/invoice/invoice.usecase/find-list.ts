import { GetInvoiceReq, InvoiceList } from '@/entities/invoice.entity'

import { InvoiceUsecaseDeps } from '../invoice.usecase'

export async function findInvoiceList(
  deps: InvoiceUsecaseDeps,
  req: GetInvoiceReq,
): Promise<InvoiceList> {
  return deps.repo.findList(req)
}
