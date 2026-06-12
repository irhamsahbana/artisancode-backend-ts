import { eq, and, isNull, sql } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { invoices } from '@/db/schema'
import { GetInvoiceReq, Invoice, InvoiceList } from '@/entities/invoice.entity'

import { InvoiceRepoDeps } from '../invoice.repo'

export async function findInvoiceList(
  deps: InvoiceRepoDeps,
  req: GetInvoiceReq,
): Promise<InvoiceList> {
  const { page = 1, per_page = 10 } = req.pagination || {}
  const offset = (page - 1) * per_page

  const conditions = [eq(invoices.companyId, req.company_id), isNull(invoices.deletedAt)]

  if (req.enrollment_id) {
    conditions.push(eq(invoices.enrollmentId, req.enrollment_id))
  }
  if (req.status) {
    conditions.push(eq(invoices.status, req.status as Invoice['status']))
  }

  const where = and(...conditions)

  const exec = getExecutor()
  const [items, countResult] = await Promise.all([
    exec
      .select()
      .from(invoices)
      .where(where)
      .orderBy(sql`${invoices.createdAt} desc`)
      .limit(per_page)
      .offset(offset),
    exec
      .select({ count: sql<number>`count(*)::int` })
      .from(invoices)
      .where(where),
  ])

  const total = countResult[0]?.count ?? 0

  return {
    items: items.map((item) => deps.mapToEntity(item)),
    pagination: {
      total,
      last_page: Math.ceil(total / per_page),
      page,
      per_page,
    },
  }
}
