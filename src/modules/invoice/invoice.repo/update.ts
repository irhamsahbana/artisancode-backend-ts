import { eq } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { invoices } from '@/db/schema'
import { Invoice, UpdateInvoiceReq } from '@/entities/invoice.entity'

import { InvoiceRepoDeps } from '../invoice.repo'

export async function updateInvoice(
  deps: InvoiceRepoDeps,
  data: UpdateInvoiceReq,
): Promise<Invoice> {
  const updateData: Record<string, unknown> = {}
  if (data.status) updateData.status = data.status
  if (data.paid_at) updateData.paidAt = data.paid_at
  if (data.doku_invoice_id) updateData.dokuInvoiceId = data.doku_invoice_id
  if (data.doku_request_id) updateData.dokuRequestId = data.doku_request_id
  if (data.payment_url) updateData.paymentUrl = data.payment_url

  const exec = getExecutor()
  const [row] = await exec
    .update(invoices)
    .set(updateData)
    .where(eq(invoices.id, data.id))
    .returning()
  return deps.mapToEntity(row)
}
