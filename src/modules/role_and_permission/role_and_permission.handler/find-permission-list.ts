import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { IRoleAndPermissionUsecase } from '@/contracts/role_and_permission.contract'
import * as Entity from '@/entities/role.entity'

export function findPermissionListHandler(usecase: IRoleAndPermissionUsecase) {
  return async (c: Context<AppEnv>) => {
    const query = c.get('body')?._query || c.req.query()
    const { page, limit, q } = query as { page: number; limit: number; q: string }
    const payload: Entity.GetPermissionReq = {
      q,
      pagination: {
        page: Number(page) || 1,
        per_page: Number(limit) || 10,
      },
    }
    const data = await usecase.findPermissionList(payload)
    return c.json(responseSuccess(data))
  }
}
