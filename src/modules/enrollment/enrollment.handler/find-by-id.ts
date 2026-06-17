import { Context } from 'hono'

import { withSpan } from '@/common/packages/observability'
import { AppEnv, ErrorCode } from '@/common/packages/types'
import { responseError, responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { IEnrollmentUsecase } from '@/contracts/enrollment.contract'

export function findEnrollmentByIdHandler(usecase: IEnrollmentUsecase) {
  return async (c: Context<AppEnv>) => {
    return withSpan('EnrollmentHandler.findById', async () => {
      const id = c.req.param('id') ?? ''
      const user = getUserContext()

      const data = await usecase.findById(id, user?.company_id || '')
      if (!data) {
        return c.json(responseError('Enrollment not found', undefined, ErrorCode.ENROLLMENT_NOT_FOUND), 404)
      }
      return c.json(responseSuccess(data))
    })
  }
}
