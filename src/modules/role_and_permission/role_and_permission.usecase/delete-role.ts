import { AppError, ErrorCode } from '@/common/packages/types'

import { RoleAndPermissionUsecaseDeps } from '../role_and_permission.usecase'

export async function deleteRole(
  deps: RoleAndPermissionUsecaseDeps,
  id: string,
  companyId?: string,
): Promise<void> {
  const existing = await deps.repo.findRoleById(id, companyId)
  if (!existing) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Role not found')
  }
  await deps.repo.deleteRole(id, companyId)
}
