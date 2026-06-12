import { Context } from 'hono'

import { responseError, responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import { IRoleAndPermissionUsecase } from '@/contracts/role_and_permission.contract'

export function findRoleByIdHandler(usecase: IRoleAndPermissionUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')
    const companyId = user?.company_id || ''

    const data = await usecase.findRoleById(id, companyId)
    if (!data) {
      return c.json(responseError('Role not found'), 404)
    }
    return c.json(responseSuccess(data))
  }
}
