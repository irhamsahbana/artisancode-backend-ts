import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { ITeacherUsecase } from '@/contracts/teacher.contract'
import * as Entity from '@/entities/teacher.entity'

export function findTeacherListHandler(usecase: ITeacherUsecase) {
  return async (c: Context<AppEnv>) => {
    const query = c.get('body')?._query || c.req.query()
    const { page, limit, q, branch_id } = query as {
      page: number
      limit: number
      q: string
      branch_id: string
    }
    const user = c.get('user')

    const payload: Entity.GetTeacherReq = {
      company_id: user?.company_id || '',
      q,
      branch_id,
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
