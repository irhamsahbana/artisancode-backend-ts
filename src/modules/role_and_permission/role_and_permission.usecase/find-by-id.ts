import * as Entity from '@/entities/role.entity'

import { RoleAndPermissionUsecaseDeps } from '../role_and_permission.usecase'

export async function findRoleById(
  deps: RoleAndPermissionUsecaseDeps,
  id: string,
  companyId?: string,
): Promise<Entity.Role | null> {
  return deps.repo.findRoleById(id, companyId)
}
