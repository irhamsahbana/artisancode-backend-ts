import { IRoleAndPermissionRepo } from '@/contracts/role_and_permission.contract'
import { permissions, roles } from '@/db/schema'
import * as Entity from '@/entities/role.entity'

import { createRole } from './role_and_permission.repo/create-role'
import { deleteRole } from './role_and_permission.repo/delete-role'
import { findRoleById } from './role_and_permission.repo/find-by-id'
import { findPermissionList } from './role_and_permission.repo/find-permission-list'
import { findRoleList } from './role_and_permission.repo/find-role-list'
import { updateRole } from './role_and_permission.repo/update-role'

export interface RoleAndPermissionRepoDeps {
  toRoleEntity: (
    data: typeof roles.$inferSelect & {
      rolePermissions?: { permission: typeof permissions.$inferSelect }[]
    },
  ) => Entity.Role
  toPermissionEntity: (data: typeof permissions.$inferSelect) => Entity.Permission
}

function toRoleEntity(
  data: typeof roles.$inferSelect & {
    rolePermissions?: { permission: typeof permissions.$inferSelect }[]
  },
): Entity.Role {
  const permissionsList = data.rolePermissions?.map((rp) => ({
    id: rp.permission.id,
    name: rp.permission.name,
    description: rp.permission.description,
    createdAt: rp.permission.createdAt,
    updatedAt: rp.permission.updatedAt,
    deletedAt: rp.permission.deletedAt,
  }))
  return {
    id: data.id,
    companyId: data.companyId ?? undefined,
    name: data.name,
    description: data.description,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    deletedAt: data.deletedAt,
    permissions: permissionsList,
  }
}

function toPermissionEntity(data: typeof permissions.$inferSelect): Entity.Permission {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    deletedAt: data.deletedAt,
  }
}

export function createRoleAndPermissionRepo(): IRoleAndPermissionRepo {
  const deps: RoleAndPermissionRepoDeps = { toRoleEntity, toPermissionEntity }

  return {
    createRole: (req) => createRole(deps, req),
    findRoleList: (req) => findRoleList(deps, req),
    findRoleById: (id, companyId) => findRoleById(deps, id, companyId),
    updateRole: (req) => updateRole(deps, req),
    deleteRole: (id, companyId) => deleteRole(id, companyId),
    findPermissionList: (req) => findPermissionList(deps, req),
  }
}

export default createRoleAndPermissionRepo
