import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { IBranchUsecase } from '@/contracts/branch.contract'
import * as Entity from '@/entities/branch.entity'

export function findBranchListHandler(usecase: IBranchUsecase) {
  return async (c: Context<AppEnv>) => {
    const query = c.get('body')?._query || c.req.query()
    const { page, limit, q } = query as { page: number; limit: number; q: string }
    const user = getUserContext()
    const companyId = user?.company_id || ''

    const payload: Entity.GetBranchReq = {
      company_id: companyId,
      q,
      pagination: {
        page: Number(page) || 1,
        per_page: Number(limit) || 10,
      },
    }

    const data = await usecase.findList(payload)
    return c.json(responseSuccess(data))
  }
}
