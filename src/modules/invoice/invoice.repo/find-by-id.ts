import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { enrollments, invoices, productPricings, products, students } from '@/db/schema'
import { Invoice } from '@/entities/invoice.entity'

import { InvoiceRepoDeps } from '../invoice.repo'

export async function findInvoiceById(
  deps: InvoiceRepoDeps,
  id: string,
  companyId: string,
): Promise<Invoice | null> {
  const exec = getExecutor()
  const [row] = await exec
    .select()
    .from(invoices)
    .where(
      and(eq(invoices.id, id), eq(invoices.companyId, companyId), isNull(invoices.deletedAt)),
    )
    .limit(1)
  if (!row) return null

  const [enrollment] = await exec
    .select()
    .from(enrollments)
    .where(eq(enrollments.id, row.enrollmentId))
    .limit(1)

  let student = null
  let product = null
  let pricing = null

  if (enrollment) {
    ;[student, product, pricing] = await Promise.all([
      enrollment.studentId
        ? exec
            .select()
            .from(students)
            .where(eq(students.id, enrollment.studentId))
            .then((r) => r[0] ?? null)
        : null,
      enrollment.productId
        ? exec
            .select()
            .from(products)
            .where(eq(products.id, enrollment.productId))
            .then((r) => r[0] ?? null)
        : null,
      enrollment.productPricingId
        ? exec
            .select()
            .from(productPricings)
            .where(eq(productPricings.id, enrollment.productPricingId))
            .then((r) => r[0] ?? null)
        : null,
    ])
  }

  return deps.mapToEntity({
    ...row,
    enrollment: enrollment
      ? {
          ...enrollment,
          student,
          product,
          productPricing: pricing,
        }
      : null,
  })
}
