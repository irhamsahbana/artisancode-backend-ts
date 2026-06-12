import * as Entity from '@/entities/role.entity'

import { RoleAndPermissionUsecaseDeps } from '../role_and_permission.usecase'

export async function createRole(
  deps: RoleAndPermissionUsecaseDeps,
  req: Entity.CreateRoleReq,
): Promise<Entity.Role> {
  return deps.repo.createRole(req)
}
