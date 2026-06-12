import { and, ilike, isNull, sql } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { permissions } from '@/db/schema'
import * as Entity from '@/entities/role.entity'

import { RoleAndPermissionRepoDeps } from '../role_and_permission.repo'

export async function findPermissionList(
  deps: RoleAndPermissionRepoDeps,
  req: Entity.GetPermissionReq,
): Promise<Entity.PermissionList> {
  const { pagination = {}, q } = req
  const { page = 1, per_page = 10 } = pagination
  const offset = (page - 1) * per_page

  const conditions = [isNull(permissions.deletedAt)]

  if (q) {
    conditions.push(ilike(permissions.name, `%${q}%`))
  }

  const where = and(...conditions)

  const exec = getExecutor()
  const [items, countResult] = await Promise.all([
    exec
      .select()
      .from(permissions)
      .where(where)
      .orderBy(permissions.name)
      .limit(per_page)
      .offset(offset),
    exec
      .select({ count: sql<number>`count(*)::int` })
      .from(permissions)
      .where(where),
  ])

  const total = countResult[0]?.count ?? 0

  return {
    items: items.map((item) => deps.toPermissionEntity(item)),
    pagination: {
      total,
      page,
      per_page,
      last_page: Math.ceil(total / per_page),
    },
  }
}
