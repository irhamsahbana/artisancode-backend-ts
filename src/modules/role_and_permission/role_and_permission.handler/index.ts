import { IRoleAndPermissionUsecase } from '@/contracts/role_and_permission.contract'

import { createRoleHandler } from './create-role'
import { deleteRoleHandler } from './delete-role'
import { findPermissionListHandler } from './find-permission-list'
import { findRoleByIdHandler } from './find-role-by-id'
import { findRoleListHandler } from './find-role-list'
import { updateRoleHandler } from './update-role'

export function createRoleAndPermissionHandlerDeps(usecase: IRoleAndPermissionUsecase) {
  return {
    createRole: createRoleHandler(usecase),
    findRoleList: findRoleListHandler(usecase),
    findRoleById: findRoleByIdHandler(usecase),
    updateRole: updateRoleHandler(usecase),
    deleteRole: deleteRoleHandler(usecase),
    findPermissionList: findPermissionListHandler(usecase),
  }
}
