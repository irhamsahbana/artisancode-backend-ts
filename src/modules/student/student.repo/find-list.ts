import { eq, and, or, ilike, isNull, gt, lte, sql } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { students } from '@/db/schema'
import * as Entity from '@/entities/student.entity'

import { StudentRepoDeps } from '../student.repo'

export async function findStudentList(
  deps: StudentRepoDeps,
  req: Entity.GetStudentReq,
): Promise<Entity.StudentList> {
  const { pagination = {}, q, company_id, branch_id, age } = req
  const { page = 1, per_page = 10 } = pagination
  const offset = (page - 1) * per_page

  const conditions = [eq(students.companyId, company_id), isNull(students.deletedAt)]

  if (q) {
    const qCondition = or(
      ilike(students.firstName, `%${q}%`),
      ilike(students.lastName, `%${q}%`),
      ilike(students.email, `%${q}%`),
    )
    if (qCondition) conditions.push(qCondition)
  }

  if (branch_id) {
    conditions.push(eq(students.branchId, branch_id))
  }

  if (age !== undefined) {
    const today = new Date()
    const maxDate = new Date(today.getFullYear() - age, today.getMonth(), today.getDate())
    const minDate = new Date(today.getFullYear() - age - 1, today.getMonth(), today.getDate())
    const ageCondition = and(
      gt(students.dateOfBirth, minDate),
      lte(students.dateOfBirth, maxDate),
    )
    if (ageCondition) conditions.push(ageCondition)
  }

  const where = and(...conditions)

  const exec = getExecutor()
  const [items, countResult] = await Promise.all([
    exec
      .select()
      .from(students)
      .where(where)
      .orderBy(sql`${students.createdAt} desc`)
      .limit(per_page)
      .offset(offset),
    exec
      .select({ count: sql<number>`count(*)::int` })
      .from(students)
      .where(where),
  ])

  const total = countResult[0]?.count ?? 0

  return {
    items: items.map((item) => deps.toEntity(item)),
    pagination: {
      total,
      page,
      per_page,
      last_page: Math.ceil(total / per_page),
    },
  }
}
