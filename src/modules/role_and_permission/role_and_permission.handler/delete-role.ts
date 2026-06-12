import { Context } from 'hono'

import { responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import { IRoleAndPermissionUsecase } from '@/contracts/role_and_permission.contract'

export function deleteRoleHandler(usecase: IRoleAndPermissionUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')
    const companyId = user?.company_id || ''

    await usecase.deleteRole(id, companyId)
    return c.json(responseSuccess(null, 'Role deleted successfully'))
  }
}
