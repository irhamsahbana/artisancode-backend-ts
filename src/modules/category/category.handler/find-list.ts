import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { ICategoryUsecase } from '@/contracts/category.contract'
import * as Entity from '@/entities/category.entity'

export function findCategoryListHandler(usecase: ICategoryUsecase) {
  return async (c: Context<AppEnv>) => {
    const query = c.get('body')?._query || c.req.query()
    const { page, limit, q, group } = query as {
      page: number
      limit: number
      q: string
      group: string
    }
    const user = c.get('user')
    const companyId = user?.company_id || ''

    const payload: Entity.GetCategoryReq = {
      company_id: companyId,
      q,
      group,
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
