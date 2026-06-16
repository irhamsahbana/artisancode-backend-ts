import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { IRoleAndPermissionUsecase } from '@/contracts/role_and_permission.contract'
import * as Entity from '@/entities/role.entity'

export function updateRoleHandler(usecase: IRoleAndPermissionUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')
    const companyId = user?.company_id || ''
    const body = c.get('body')

    const payload = { ...body, id } as Entity.UpdateRoleReq
    payload.user = user

    if (companyId) {
      payload.company_id = companyId
    }

    const data = await usecase.updateRole(payload)
    return c.json(responseSuccess(data, 'Role updated successfully'))
  }
}
