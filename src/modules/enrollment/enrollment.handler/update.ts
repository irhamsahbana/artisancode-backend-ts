import { Context } from 'hono'

import { withSpan } from '@/common/packages/observability'
import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { IEnrollmentUsecase } from '@/contracts/enrollment.contract'
import * as Entity from '@/entities/enrollment.entity'

export function updateEnrollmentHandler(usecase: IEnrollmentUsecase) {
  return async (c: Context<AppEnv>) => {
    return withSpan('EnrollmentHandler.update', async () => {
      const id = c.req.param('id') ?? ''
      const user = getUserContext()
      const body = c.get('body')

      const payload: Entity.UpdateEnrollmentReq = {
        ...body,
        id,
        company_id: user?.company_id || '',
        next_billing_date: body.next_payment_date,
      }

      const data = await usecase.update(payload)
      return c.json(responseSuccess(data, 'Enrollment updated successfully'))
    })
  }
}
