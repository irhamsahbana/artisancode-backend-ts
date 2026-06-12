import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { invoices } from '@/db/schema'
import { Invoice } from '@/entities/invoice.entity'

import { InvoiceRepoDeps } from '../invoice.repo'

export async function findInvoiceByInvoiceNumber(
  deps: InvoiceRepoDeps,
  invoiceNumber: string,
  companyId: string,
): Promise<Invoice | null> {
  const exec = getExecutor()
  const [row] = await exec
    .select()
    .from(invoices)
    .where(
      and(
        eq(invoices.invoiceNumber, invoiceNumber),
        eq(invoices.companyId, companyId),
        isNull(invoices.deletedAt),
      ),
    )
    .limit(1)
  return row ? deps.mapToEntity(row) : null
}
