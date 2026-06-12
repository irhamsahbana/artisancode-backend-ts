import { eq, and, isNull, sql } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { users } from '@/db/schema'
import * as Entity from '@/entities/user.entity'

import { UserRepoDeps } from '../user.repo'

export async function findUserList(
  deps: UserRepoDeps,
  req: Entity.GetUserReq,
): Promise<Entity.UserList> {
  const { pagination = {}, ...rest } = req
  const { page = 1, per_page = 10 } = pagination
  const offset = (page - 1) * per_page

  const conditions = [isNull(users.deletedAt)]

  if (rest.id) {
    conditions.push(eq(users.id, rest.id))
  }
  if (rest.username) {
    conditions.push(eq(users.username, rest.username))
  }
  if (rest.company_id) {
    conditions.push(eq(users.companyId, rest.company_id))
  }

  const where = and(...conditions)

  const exec = getExecutor()
  const [items, countResult] = await Promise.all([
    exec
      .select()
      .from(users)
      .where(where)
      .orderBy(sql`${users.createdAt} desc`)
      .limit(per_page)
      .offset(offset),
    exec
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
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
