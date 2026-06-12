import { eq, and, ilike, inArray, isNull, sql } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { permissions, rolePermissions, roles } from '@/db/schema'
import * as Entity from '@/entities/role.entity'

import { RoleAndPermissionRepoDeps } from '../role_and_permission.repo'

export async function findRoleList(
  deps: RoleAndPermissionRepoDeps,
  req: Entity.GetRoleReq,
): Promise<Entity.RoleList> {
  const { pagination = {}, q } = req
  const { page = 1, per_page = 10 } = pagination
  const offset = (page - 1) * per_page

  const conditions = [isNull(roles.deletedAt)]

  if (req.company_id) {
    conditions.push(eq(roles.companyId, req.company_id))
  }

  if (q) {
    conditions.push(ilike(roles.name, `%${q}%`))
  }

  if (req.ids && req.ids.length > 0) {
    conditions.push(inArray(roles.id, req.ids))
  }

  const where = and(...conditions)

  const exec = getExecutor()
  const [items, countResult] = await Promise.all([
    exec
      .select()
      .from(roles)
      .where(where)
      .orderBy(sql`${roles.createdAt} desc`)
      .limit(per_page)
      .offset(offset),
    exec
      .select({ count: sql<number>`count(*)::int` })
      .from(roles)
      .where(where),
  ])

  const roleIds = items.map((r) => r.id)
  const allRolePermissions =
    roleIds.length > 0
      ? await getExecutor()
          .select()
          .from(rolePermissions)
          .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
          .where(inArray(rolePermissions.roleId, roleIds))
      : []

  const permissionsByRole = new Map<string, typeof allRolePermissions>()
  for (const rp of allRolePermissions) {
    const roleId = rp.role_permissions.roleId
    const existing = permissionsByRole.get(roleId)
    if (existing) {
      existing.push(rp)
    } else {
      permissionsByRole.set(roleId, [rp])
    }
  }

  const total = countResult[0]?.count ?? 0

  return {
    items: items.map((item) => {
      const rps = permissionsByRole.get(item.id) || []
      return deps.toRoleEntity({
        ...item,
        rolePermissions: rps.map((rp) => ({ permission: rp.permissions })),
      })
    }),
    pagination: {
      total,
      page,
      per_page,
      last_page: Math.ceil(total / per_page),
    },
  }
}
