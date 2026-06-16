import { getExecutor } from '@/common/executor'
import { AppError } from '@/common/packages/types'
import { rolePermissions, roles } from '@/db/schema'
import * as Entity from '@/entities/role.entity'

import { RoleErrorCode } from '../role_and_permission.errors'
import { RoleAndPermissionRepoDeps } from '../role_and_permission.repo'
import { findRoleById } from './find-by-id'

export async function createRole(
  deps: RoleAndPermissionRepoDeps,
  req: Entity.CreateRoleReq,
): Promise<Entity.Role> {
  if (!req.company_id) {
    throw new AppError(RoleErrorCode.COMPANY_REQUIRED, 'Company ID is required to create a role', { httpCode: 400 })
  }

  const [role] = await getExecutor()
    .insert(roles)
    .values({
      name: req.name,
      description: req.description || '',
      companyId: req.company_id,
    })
    .returning()

  if (req.permission_ids && req.permission_ids.length > 0) {
    await getExecutor().insert(rolePermissions).values(
      req.permission_ids.map((permissionId) => ({
        roleId: role.id,
        permissionId,
      })),
    )
  }

  return findRoleById(deps, role.id, req.company_id) as Promise<Entity.Role>
}
