import { eq, and, isNull, sql } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { enrollments } from '@/db/schema'
import * as Entity from '@/entities/enrollment.entity'

import { findEnrollmentsWithRelations } from '../enrollment.mapper'
import { EnrollmentRepoDeps } from '../enrollment.repo'

export async function findEnrollmentList(
  deps: EnrollmentRepoDeps,
  req: Entity.GetEnrollmentReq,
): Promise<Entity.EnrollmentList> {
  const { pagination = {}, company_id, branch_id, student_id, program_id, pricing_id } = req
  const { page = 1, per_page = 10 } = pagination
  const offset = (page - 1) * per_page

  const conditions = [eq(enrollments.companyId, company_id), isNull(enrollments.deletedAt)]

  if (branch_id) {
    conditions.push(eq(enrollments.branchId, branch_id))
  }

  if (student_id) {
    conditions.push(eq(enrollments.studentId, student_id))
  }

  if (program_id) {
    conditions.push(eq(enrollments.productId, program_id))
  }

  if (pricing_id) {
    conditions.push(eq(enrollments.productPricingId, pricing_id))
  }

  const where = and(...conditions)

  const exec = getExecutor()
  const [items, countResult] = await Promise.all([
    findEnrollmentsWithRelations(where, { limit: per_page, offset }),
    exec
      .select({ count: sql<number>`count(*)::int` })
      .from(enrollments)
      .where(where),
  ])

  const total = countResult[0]?.count ?? 0

  return {
    items: items.map((item) => deps.toEnrollmentEntity(item)),
    pagination: {
      total,
      page,
      per_page,
      last_page: Math.ceil(total / per_page),
    },
  }
}
