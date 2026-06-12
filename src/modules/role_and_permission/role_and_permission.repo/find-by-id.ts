import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { permissions, rolePermissions, roles } from '@/db/schema'
import * as Entity from '@/entities/role.entity'

import { RoleAndPermissionRepoDeps } from '../role_and_permission.repo'

export async function findRoleById(
  deps: RoleAndPermissionRepoDeps,
  id: string,
  companyId?: string,
): Promise<Entity.Role | null> {
  const conditions = [eq(roles.id, id), isNull(roles.deletedAt)]

  if (companyId) {
    conditions.push(eq(roles.companyId, companyId))
  }

  const [role] = await getExecutor()
    .select()
    .from(roles)
    .where(and(...conditions))
    .limit(1)
  if (!role) return null

  const rps = await getExecutor()
    .select()
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, id))

  return deps.toRoleEntity({
    ...role,
    rolePermissions: rps.map((rp) => ({ permission: rp.permissions })),
  })
}
