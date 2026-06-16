import { Context } from 'hono'

import { withSpan } from '@/common/packages/observability'
import { responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import { IEnrollmentUsecase } from '@/contracts/enrollment.contract'

export function deleteEnrollmentHandler(usecase: IEnrollmentUsecase) {
  return async (c: Context<AppEnv>) => {
    return withSpan('EnrollmentHandler.delete', async () => {
      const id = c.req.param('id') ?? ''
      const user = c.get('user')

      await usecase.delete(id, user?.company_id || '')
      return c.json(responseSuccess(null, 'Enrollment deleted successfully'))
    })
  }
}
