import { eq, and, ilike, isNull, sql } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { products as productsTable } from '@/db/schema'
import * as Entity from '@/entities/program.entity'

import { ProgramRepoDeps } from '../program.repo'

export async function findProgramList(
  deps: ProgramRepoDeps,
  req: Entity.GetProgramReq,
): Promise<Entity.ProgramList> {
  const { pagination = {}, q, company_id, branch_id } = req
  const { page = 1, per_page = 10 } = pagination
  const offset = (page - 1) * per_page

  const conditions = [eq(productsTable.companyId, company_id), isNull(productsTable.deletedAt)]

  if (q) {
    conditions.push(ilike(productsTable.name, `%${q}%`))
  }

  if (branch_id) {
    conditions.push(
      sql`(${productsTable.branchId} = ${branch_id} OR ${productsTable.branchId} IS NULL)`,
    )
  }

  const where = and(...conditions)

  const exec = getExecutor()
  const [items, countResult] = await Promise.all([
    exec
      .select()
      .from(productsTable)
      .where(where)
      .orderBy(sql`${productsTable.createdAt} desc`)
      .limit(per_page)
      .offset(offset),
    exec
      .select({ count: sql<number>`count(*)::int` })
      .from(productsTable)
      .where(where),
  ])

  const total = countResult[0]?.count ?? 0

  const itemsWithRelations = await Promise.all(
    items.map((item) => deps.fetchProductWithRelations(item.id)),
  )

  return {
    items: itemsWithRelations.map((item) => deps.toProgramEntity(item)),
    pagination: {
      total,
      page,
      per_page,
      last_page: Math.ceil(total / per_page),
    },
  }
}
