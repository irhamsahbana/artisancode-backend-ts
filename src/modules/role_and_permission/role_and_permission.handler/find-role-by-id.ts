import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseError, responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { IRoleAndPermissionUsecase } from '@/contracts/role_and_permission.contract'

export function findRoleByIdHandler(usecase: IRoleAndPermissionUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = getUserContext()
    const companyId = user?.company_id || ''

    const data = await usecase.findRoleById(id, companyId)
    if (!data) {
      return c.json(responseError('Role not found'), 404)
    }
    return c.json(responseSuccess(data))
  }
}
