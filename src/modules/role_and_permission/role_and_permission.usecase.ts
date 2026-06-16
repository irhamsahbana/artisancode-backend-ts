import { withSpan } from '@/common/packages/observability'
import { IRoleAndPermissionRepo, IRoleAndPermissionUsecase } from '@/contracts/role_and_permission.contract'

import { createRole } from './role_and_permission.usecase/create-role'
import { deleteRole } from './role_and_permission.usecase/delete-role'
import { findRoleById } from './role_and_permission.usecase/find-by-id'
import { findPermissionList } from './role_and_permission.usecase/find-permission-list'
import { findRoleList } from './role_and_permission.usecase/find-role-list'
import { updateRole } from './role_and_permission.usecase/update-role'

export interface RoleAndPermissionUsecaseDeps {
  repo: IRoleAndPermissionRepo
}

export function createRoleAndPermissionUsecase(
  repo: IRoleAndPermissionRepo,
): IRoleAndPermissionUsecase {
  const deps: RoleAndPermissionUsecaseDeps = { repo }

  return {
    createRole: (req) =>
      withSpan('RoleAndPermissionUsecase.createRole', () =>
        createRole(deps, req)),
    findRoleList: (req) => findRoleList(deps, req),
    findRoleById: (id, companyId) => findRoleById(deps, id, companyId),
    updateRole: (req) =>
      withSpan('RoleAndPermissionUsecase.updateRole', () =>
        updateRole(deps, req)),
    deleteRole: (id, companyId) => deleteRole(deps, id, companyId),
    findPermissionList: (req) => findPermissionList(deps, req),
  }
}

export default createRoleAndPermissionUsecase
