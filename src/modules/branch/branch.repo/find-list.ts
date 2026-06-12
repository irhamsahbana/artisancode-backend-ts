import { eq, and, ilike, isNull, sql } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { branches } from '@/db/schema'
import * as Entity from '@/entities/branch.entity'

import { BranchRepoDeps } from '../branch.repo'

export async function findBranchList(
  deps: BranchRepoDeps,
  req: Entity.GetBranchReq,
): Promise<Entity.BranchList> {
  const { pagination = {}, q, company_id } = req
  const { page = 1, per_page = 10 } = pagination
  const offset = (page - 1) * per_page

  const conditions = [eq(branches.companyId, company_id), isNull(branches.deletedAt)]

  if (q) {
    conditions.push(ilike(branches.name, `%${q}%`))
  }

  const where = and(...conditions)

  const exec = getExecutor()
  const [items, countResult] = await Promise.all([
    exec
      .select()
      .from(branches)
      .where(where)
      .orderBy(sql`${branches.createdAt} desc`)
      .limit(per_page)
      .offset(offset),
    exec
      .select({ count: sql<number>`count(*)::int` })
      .from(branches)
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
