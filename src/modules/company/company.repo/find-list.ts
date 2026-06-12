import { eq, and, ilike, inArray, isNull, sql } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { companies } from '@/db/schema'
import * as Entity from '@/entities/company.entity'

export async function findCompanyList(req: Entity.GetCompanyReq): Promise<Entity.CompanyList> {
  const { pagination = {}, q, accessible_company_id, ids, id } = req
  const { page = 1, per_page = 10 } = pagination
  const offset = (page - 1) * per_page

  const conditions = [isNull(companies.deletedAt)]

  if (id) {
    conditions.push(eq(companies.id, id))
  }

  if (q) {
    conditions.push(ilike(companies.name, `%${q}%`))
  }

  if (accessible_company_id) {
    conditions.push(eq(companies.id, accessible_company_id))
  } else if (ids && ids.length > 0) {
    conditions.push(inArray(companies.id, ids))
  }

  const where = and(...conditions)

  const exec = getExecutor()
  const [items, countResult] = await Promise.all([
    exec.select().from(companies).where(where).limit(per_page).offset(offset),
    exec
      .select({ count: sql<number>`count(*)::int` })
      .from(companies)
      .where(where),
  ])

  const total = countResult[0]?.count ?? 0

  return {
    items: items as Entity.Company[],
    pagination: {
      total,
      page,
      per_page,
      last_page: Math.ceil(total / per_page),
    },
  }
}
