import { withSpan } from '@/telemetry'

import { IRoleAndPermissionRepo, IRoleAndPermissionUsecase } from './role_and_permission.contract'
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
      withSpan('role_and_permission.usecase', 'RoleAndPermissionUsecase.createRole', () =>
        createRole(deps, req)),
    findRoleList: (req) =>
      withSpan('role_and_permission.usecase', 'RoleAndPermissionUsecase.findRoleList', () =>
        findRoleList(deps, req)),
    findRoleById: (id, companyId) =>
      withSpan('role_and_permission.usecase', 'RoleAndPermissionUsecase.findRoleById', () =>
        findRoleById(deps, id, companyId)),
    updateRole: (req) =>
      withSpan('role_and_permission.usecase', 'RoleAndPermissionUsecase.updateRole', () =>
        updateRole(deps, req)),
    deleteRole: (id, companyId) =>
      withSpan('role_and_permission.usecase', 'RoleAndPermissionUsecase.deleteRole', () =>
        deleteRole(deps, id, companyId)),
    findPermissionList: (req) =>
      withSpan('role_and_permission.usecase', 'RoleAndPermissionUsecase.findPermissionList', () =>
        findPermissionList(deps, req)),
  }
}

export default createRoleAndPermissionUsecase
