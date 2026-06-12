import { eq, and } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { rolePermissions, roles } from '@/db/schema'
import * as Entity from '@/entities/role.entity'

import { findRoleById } from './find-by-id'
import { RoleAndPermissionRepoDeps } from '../role_and_permission.repo'

export async function updateRole(
  deps: RoleAndPermissionRepoDeps,
  req: Entity.UpdateRoleReq,
): Promise<Entity.Role> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, permission_ids, company_id, user, ...rest } = req

  if (permission_ids) {
    await getExecutor().delete(rolePermissions).where(eq(rolePermissions.roleId, id))

    if (permission_ids.length > 0) {
      await getExecutor().insert(rolePermissions).values(
        permission_ids.map((permissionId) => ({
          roleId: id,
          permissionId,
        })),
      )
    }
  }

  const whereConditions = [eq(roles.id, id)]
  if (company_id) {
    whereConditions.push(eq(roles.companyId, company_id))
  }

  await getExecutor()
    .update(roles)
    .set(rest)
    .where(and(...whereConditions))

  return findRoleById(deps, id, company_id) as Promise<Entity.Role>
}
