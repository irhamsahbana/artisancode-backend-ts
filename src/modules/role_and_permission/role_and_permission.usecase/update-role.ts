import { AppError } from '@/common/app_error'
import * as Entity from '@/entities/role.entity'

import { RoleAndPermissionUsecaseDeps } from '../role_and_permission.usecase'

export async function updateRole(
  deps: RoleAndPermissionUsecaseDeps,
  req: Entity.UpdateRoleReq,
): Promise<Entity.Role> {
  const existing = await deps.repo.findRoleById(req.id, req.company_id)
  if (!existing) {
    throw new AppError(404, 'Role not found')
  }
  return deps.repo.updateRole(req)
}
