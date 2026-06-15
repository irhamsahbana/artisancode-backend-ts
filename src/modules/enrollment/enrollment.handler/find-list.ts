import { Context } from 'hono'

import { responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import { IEnrollmentUsecase } from '@/contracts/enrollment.contract'
import * as Entity from '@/entities/enrollment.entity'
import { withSpan } from '@/telemetry'

export function findEnrollmentListHandler(usecase: IEnrollmentUsecase) {
  return async (c: Context<AppEnv>) => {
    return withSpan('EnrollmentHandler.findList', async () => {
      const query = c.get('body')?._query || c.req.query()
      const { page, limit, branch_id, student_id, program_id } = query as {
        page: number
        limit: number
        branch_id: string
        student_id: string
        program_id: string
      }
      const user = c.get('user')

      const payload: Entity.GetEnrollmentReq = {
        company_id: user?.company_id || '',
        branch_id,
        student_id,
        program_id,
        pagination: {
          page: Number(page) || 1,
          per_page: Number(limit) || 10,
        },
        user,
      }

      const data = await usecase.findList(payload)
      return c.json(responseSuccess(data))
    })
  }
}
