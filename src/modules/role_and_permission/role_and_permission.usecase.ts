import * as Entity from '@/entities/role.entity'

import { IRoleAndPermissionRepo, IRoleAndPermissionUsecase } from './role_and_permission.contract'

export default class RoleAndPermissionUsecase implements IRoleAndPermissionUsecase {
  constructor(private repo: IRoleAndPermissionRepo) {}

  // Role Methods
  async createRole(req: Entity.CreateRoleReq): Promise<Entity.Role> {
    return this.repo.createRole(req)
  }

  async findRoleList(req: Entity.GetRoleReq): Promise<Entity.RoleList> {
    return this.repo.findRoleList(req)
  }

  async findRoleById(id: string, companyId?: string): Promise<Entity.Role | null> {
    return this.repo.findRoleById(id, companyId)
  }

  async updateRole(req: Entity.UpdateRoleReq): Promise<Entity.Role> {
    const existing = await this.repo.findRoleById(req.id, req.company_id)
    if (!existing) {
      throw new Error('Role not found')
    }
    return this.repo.updateRole(req)
  }

  async deleteRole(id: string, companyId?: string): Promise<void> {
    const existing = await this.repo.findRoleById(id, companyId)
    if (!existing) {
      throw new Error('Role not found')
    }
    await this.repo.deleteRole(id, companyId)
  }

  // Permission Methods
  async findPermissionList(req: Entity.GetPermissionReq): Promise<Entity.PermissionList> {
    return this.repo.findPermissionList(req)
  }
}
