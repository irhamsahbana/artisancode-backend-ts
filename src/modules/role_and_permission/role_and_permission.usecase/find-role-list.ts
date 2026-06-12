import * as Entity from '@/entities/role.entity'

import { RoleAndPermissionUsecaseDeps } from '../role_and_permission.usecase'

export async function findRoleList(
  deps: RoleAndPermissionUsecaseDeps,
  req: Entity.GetRoleReq,
): Promise<Entity.RoleList> {
  return deps.repo.findRoleList(req)
}
