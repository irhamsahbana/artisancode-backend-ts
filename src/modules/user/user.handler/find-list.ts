import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { IUserUsecase } from '@/contracts/user.contract'
import * as Entity from '@/entities/user.entity'

export function findUserListHandler(usecase: IUserUsecase) {
  return async (c: Context<AppEnv>) => {
    const query = c.get('body')?._query || c.req.query()
    const { page, limit, q } = query as { page: number; limit: number; q: string }
    const user = getUserContext()
    const companyId = user?.company_id || ''

    const payload: Entity.GetUserReq = {
      pagination: {
        page: Number(page) || 1,
        per_page: Number(limit) || 10,
      },
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
