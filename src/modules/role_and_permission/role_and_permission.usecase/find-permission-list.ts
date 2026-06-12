import * as Entity from '@/entities/role.entity'

import { RoleAndPermissionUsecaseDeps } from '../role_and_permission.usecase'

export async function findPermissionList(
  deps: RoleAndPermissionUsecaseDeps,
  req: Entity.GetPermissionReq,
): Promise<Entity.PermissionList> {
  return deps.repo.findPermissionList(req)
}
