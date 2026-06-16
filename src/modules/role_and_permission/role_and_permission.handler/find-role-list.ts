import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { IRoleAndPermissionUsecase } from '@/contracts/role_and_permission.contract'
import * as Entity from '@/entities/role.entity'

export function findRoleListHandler(usecase: IRoleAndPermissionUsecase) {
  return async (c: Context<AppEnv>) => {
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

    const data = await usecase.findRoleList(payload)
    return c.json(responseSuccess(data))
  }
}
