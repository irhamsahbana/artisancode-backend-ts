import { Context } from 'hono'

import { responseError, responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import * as Entity from '@/entities/role.entity'

import { IRoleAndPermissionUsecase } from './role_and_permission.contract'

export default class RoleAndPermissionHandler {
  constructor(private usecase: IRoleAndPermissionUsecase) {}

  // Role Handlers
  createRole = async (c: Context<AppEnv>) => {
    const body = c.get('body')
    const payload = body as Entity.CreateRoleReq
    const user = c.get('user')
    const companyId = user?.company_id || ''

    if (companyId) {
      payload.company_id = companyId
    }
    payload.user = user

    const data = await this.usecase.createRole(payload)
    return c.json(responseSuccess(data, 'Role created successfully'), 201)
  }

  findRoleList = async (c: Context<AppEnv>) => {
    const query = c.get('body')?._query || c.req.query()
    const { page, limit, q, ids } = query as {
      page: number
      limit: number
      q: string
      ids: string
    }
    const user = c.get('user')
    const companyId = user?.company_id || ''

    const payload: Entity.GetRoleReq = {
      q,
      ids: ids ? ids.split(',') : undefined,
      pagination: {
        page: Number(page) || 1,
        per_page: Number(limit) || 10,
      },
      user,
    }

    if (companyId) {
      payload.company_id = companyId
    }

    const data = await this.usecase.findRoleList(payload)
    return c.json(responseSuccess(data))
  }

  findRoleById = async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')
    const companyId = user?.company_id || ''

    const data = await this.usecase.findRoleById(id, companyId)
    if (!data) {
      return c.json(responseError('Role not found'), 404)
    }
    return c.json(responseSuccess(data))
  }

  updateRole = async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')
    const companyId = user?.company_id || ''
    const body = c.get('body')

    const payload = { ...body, id } as Entity.UpdateRoleReq
    payload.user = user

    if (companyId) {
      payload.company_id = companyId
    }

    const data = await this.usecase.updateRole(payload)
    return c.json(responseSuccess(data, 'Role updated successfully'))
  }

  deleteRole = async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')
    const companyId = user?.company_id || ''

    await this.usecase.deleteRole(id, companyId)
    return c.json(responseSuccess(null, 'Role deleted successfully'))
  }

  // Permission Handlers
  findPermissionList = async (c: Context<AppEnv>) => {
    const query = c.get('body')?._query || c.req.query()
    const { page, limit, q } = query as { page: number; limit: number; q: string }
    const payload: Entity.GetPermissionReq = {
      q,
      pagination: {
        page: Number(page) || 1,
        per_page: Number(limit) || 10,
      },
    }
    const data = await this.usecase.findPermissionList(payload)
    return c.json(responseSuccess(data))
  }
}
