import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { IProgramUsecase } from '@/contracts/program.contract'
import * as Entity from '@/entities/program.entity'

export function findProgramListHandler(usecase: IProgramUsecase) {
  return async (c: Context<AppEnv>) => {
    const query = c.get('body')?._query || c.req.query()
    const { page, limit, q, branch_id } = query as {
      page: number
      limit: number
      q: string
      branch_id: string
    }
    const user = getUserContext()

    const payload: Entity.GetProgramReq = {
      company_id: user?.company_id || '',
      q,
      branch_id,
      pagination: {
        page: Number(page) || 1,
        per_page: Number(limit) || 10,
      },
    }

    const data = await usecase.findList(payload)
    return c.json(responseSuccess(data))
  }
}
