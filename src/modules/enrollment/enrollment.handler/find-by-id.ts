import { Context } from 'hono'

import { withSpan } from '@/common/packages/observability'
import { AppEnv } from '@/common/packages/types'
import { responseError, responseSuccess } from '@/common/rest_response'
import { IEnrollmentUsecase } from '@/contracts/enrollment.contract'

export function findEnrollmentByIdHandler(usecase: IEnrollmentUsecase) {
  return async (c: Context<AppEnv>) => {
    return withSpan('EnrollmentHandler.findById', async () => {
      const id = c.req.param('id') ?? ''
      const user = c.get('user')

      const data = await usecase.findById(id, user?.company_id || '')
      if (!data) {
        return c.json(responseError('Enrollment not found'), 404)
      }
      return c.json(responseSuccess(data))
    })
  }
}
