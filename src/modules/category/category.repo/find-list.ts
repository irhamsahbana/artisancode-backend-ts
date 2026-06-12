import { eq, and, ilike, isNull, sql } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { categories } from '@/db/schema'
import * as Entity from '@/entities/category.entity'

import { CategoryRepoDeps } from '../category.repo'

export async function findCategoryList(
  deps: CategoryRepoDeps,
  req: Entity.GetCategoryReq,
): Promise<Entity.CategoryList> {
  const { pagination = {}, q, company_id, group } = req
  const { page = 1, per_page = 10 } = pagination
  const offset = (page - 1) * per_page

  const conditions = [eq(categories.companyId, company_id), isNull(categories.deletedAt)]

  if (q) {
    conditions.push(ilike(categories.name, `%${q}%`))
  }

  if (group) {
    conditions.push(eq(categories.group, group))
  }

  const where = and(...conditions)

  const exec = getExecutor()
  const [items, countResult] = await Promise.all([
    exec
      .select()
      .from(categories)
      .where(where)
      .orderBy(sql`${categories.createdAt} desc`)
      .limit(per_page)
      .offset(offset),
    exec
      .select({ count: sql<number>`count(*)::int` })
      .from(categories)
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
