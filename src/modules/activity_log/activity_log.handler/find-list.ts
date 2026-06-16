import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { IActivityLogUsecase } from '@/contracts/activity_log.contract'
import * as Entity from '@/entities/activity_log.entity'

export function findActivityLogListHandler(usecase: IActivityLogUsecase) {
  return async (c: Context<AppEnv>) => {
    const query = c.get('body')?._query || c.req.query()
    const { page, limit, q, branch_id, user_id, entity_name } = query as {
      page: number
      limit: number
      q: string
      branch_id: string
      user_id: string
      entity_name: string
    }
    const user = c.get('user')
    const companyId = user?.company_id || ''

    const payload: Entity.GetActivityLogReq = {
      company_id: companyId,
      branch_id,
      user_id,
      entity_name,
      q,
      pagination: {
        page: Number(page) || 1,
        per_page: Number(limit) || 10,
      },
      user,
    }

    const data = await usecase.findList(payload)
    return c.json(responseSuccess(data))
  }
}
