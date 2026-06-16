import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { ICompanyUsecase } from '@/contracts/company.contract'
import * as Entity from '@/entities/company.entity'

export function findCompanyListHandler(usecase: ICompanyUsecase) {
  return async (c: Context<AppEnv>) => {
    const query = c.get('body')?._query || c.req.query()
    const { page, limit, q, ids } = query as {
      page: number
      limit: number
      q: string
      ids?: string
    }
    const user = getUserContext()
    const companyId = user?.company_id || ''

    const payload: Entity.GetCompanyReq = {
      ids: ids ? ids.split(',') : undefined,
      pagination: {
        page,
        per_page: limit,
      },
    }

    if (companyId) {
      payload.accessible_company_id = companyId
    }

    if (q) {
      payload.q = q
    }

    const data = await usecase.findList(payload)
    return c.json(responseSuccess(data))
  }
}
