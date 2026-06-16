import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { IStudentUsecase } from '@/contracts/student.contract'
import * as Entity from '@/entities/student.entity'

export function findStudentListHandler(usecase: IStudentUsecase) {
  return async (c: Context<AppEnv>) => {
    const query = c.get('body')?._query || c.req.query()
    const { page, limit, q, branch_id, age } = query as {
      page: number
      limit: number
      q: string
      branch_id: string
      age: number
    }
    const user = getUserContext()

    const payload: Entity.GetStudentReq = {
      company_id: user?.company_id || '',
      q,
      branch_id,
      age,
      pagination: {
        page: Number(page) || 1,
        per_page: Number(limit) || 10,
      },
    }

    const data = await usecase.findList(payload)
    return c.json(responseSuccess(data))
  }
}
