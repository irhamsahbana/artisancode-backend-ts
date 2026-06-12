import { getExecutor } from '@/common/executor'
import { generateInvoiceNumber } from '@/common/utils/invoice.util'
import { invoices } from '@/db/schema'
import { CreateInvoiceReq, Invoice } from '@/entities/invoice.entity'

import { InvoiceRepoDeps } from '../invoice.repo'

export async function createInvoice(
  deps: InvoiceRepoDeps,
  data: CreateInvoiceReq,
): Promise<Invoice> {
  const exec = getExecutor()
  const [row] = await exec
    .insert(invoices)
    .values({
      companyId: data.company_id,
      branchId: data.branch_id,
      enrollmentId: data.enrollment_id,
      amount: String(data.amount),
      currency: data.currency || 'IDR',
      dueDate: data.due_date,
      issuedDate: data.issued_date || new Date(),
      invoiceDate: data.issued_date || new Date(),
      status: (data.status as Invoice['status']) || 'pending',
      invoiceNumber: generateInvoiceNumber(),
    })
    .returning()
  return deps.mapToEntity(row)
}
