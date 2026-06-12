import { eq, and, or, ilike, isNull, sql } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { branches, teachers } from '@/db/schema'
import * as Entity from '@/entities/teacher.entity'

import { TeacherRepoDeps } from '../teacher.repo'

export async function findTeacherList(
  deps: TeacherRepoDeps,
  req: Entity.GetTeacherReq,
): Promise<Entity.TeacherList> {
  const { pagination = {}, q, company_id, branch_id } = req
  const { page = 1, per_page = 10 } = pagination
  const offset = (page - 1) * per_page

  const conditions = [eq(teachers.companyId, company_id), isNull(teachers.deletedAt)]

  if (q) {
    const qCondition = or(
      ilike(teachers.name, `%${q}%`),
      ilike(teachers.email, `%${q}%`),
      ilike(teachers.specialty, `%${q}%`),
    )
    if (qCondition) conditions.push(qCondition)
  }

  if (branch_id) {
    conditions.push(eq(teachers.branchId, branch_id))
  }

  const where = and(...conditions)

  const exec = getExecutor()
  const [items, countResult] = await Promise.all([
    exec
      .select({
        id: teachers.id,
        companyId: teachers.companyId,
        branchId: teachers.branchId,
        status: teachers.status,
        name: teachers.name,
        email: teachers.email,
        phone: teachers.phone,
        address: teachers.address,
        birthDate: teachers.birthDate,
        biography: teachers.biography,
        specialty: teachers.specialty,
        createdAt: teachers.createdAt,
        updatedAt: teachers.updatedAt,
        deletedAt: teachers.deletedAt,
        branch: {
          id: branches.id,
          name: branches.name,
        },
      })
      .from(teachers)
      .leftJoin(branches, eq(teachers.branchId, branches.id))
      .where(where)
      .orderBy(sql`${teachers.createdAt} desc`)
      .limit(per_page)
      .offset(offset),
    exec
      .select({ count: sql<number>`count(*)::int` })
      .from(teachers)
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
