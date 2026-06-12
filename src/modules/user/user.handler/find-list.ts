import { Context } from 'hono'

import { responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import { IUserUsecase } from '@/contracts/user.contract'
import * as Entity from '@/entities/user.entity'

export function findUserListHandler(usecase: IUserUsecase) {
  return async (c: Context<AppEnv>) => {
    const query = c.get('body')?._query || c.req.query()
    const { page, limit, q } = query as { page: number; limit: number; q: string }
    const user = c.get('user')
    const companyId = user?.company_id || ''

    const payload: Entity.GetUserReq = {
      pagination: {
        page: Number(page) || 1,
        per_page: Number(limit) || 10,
      },
      user,
    }

    if (companyId) {
      payload.company_id = companyId
    }

    if (q) {
      payload.username = q
    }
    const data = await usecase.findList(payload)
    return c.json(responseSuccess(data))
  }
}
