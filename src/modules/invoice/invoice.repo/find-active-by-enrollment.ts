import { eq, and, inArray, isNull, sql } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { invoices } from '@/db/schema'
import { ActiveInvoiceStatuses, Invoice } from '@/entities/invoice.entity'

import { InvoiceRepoDeps } from '../invoice.repo'

export async function findActiveInvoiceByEnrollment(
  deps: InvoiceRepoDeps,
  enrollmentId: string,
  companyId: string,
): Promise<Invoice | null> {
  const exec = getExecutor()
  const [row] = await exec
    .select()
    .from(invoices)
    .where(
      and(
        eq(invoices.enrollmentId, enrollmentId),
        eq(invoices.companyId, companyId),
        isNull(invoices.deletedAt),
        inArray(invoices.status, ActiveInvoiceStatuses),
      ),
    )
    .orderBy(sql`${invoices.createdAt} desc`)
    .limit(1)
  return row ? deps.mapToEntity(row) : null
}
