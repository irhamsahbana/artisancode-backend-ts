import { Context } from 'hono'

import { withSpan } from '@/common/packages/observability'
import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { IEnrollmentUsecase } from '@/contracts/enrollment.contract'

export function deleteEnrollmentHandler(usecase: IEnrollmentUsecase) {
  return async (c: Context<AppEnv>) => {
    return withSpan('EnrollmentHandler.delete', async () => {
      const id = c.req.param('id') ?? ''
      const user = getUserContext()

      await usecase.delete(id, user?.company_id || '')
      return c.json(responseSuccess(null, 'Enrollment deleted successfully'))
    })
  }
}
