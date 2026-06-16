import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { IRoleAndPermissionUsecase } from '@/contracts/role_and_permission.contract'
import * as Entity from '@/entities/role.entity'

export function createRoleHandler(usecase: IRoleAndPermissionUsecase) {
  return async (c: Context<AppEnv>) => {
    const body = c.get('body')
    const payload = body as Entity.CreateRoleReq
    const user = c.get('user')
    const companyId = user?.company_id || ''

    if (companyId) {
      payload.company_id = companyId
    }
    payload.user = user

    const data = await usecase.createRole(payload)
    return c.json(responseSuccess(data, 'Role created successfully'), 201)
  }
}
