import { Context } from 'hono'

import { responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import { IEnrollmentUsecase } from '@/contracts/enrollment.contract'
import * as Entity from '@/entities/enrollment.entity'
import { withSpan } from '@/telemetry'

export function updateEnrollmentHandler(usecase: IEnrollmentUsecase) {
  return async (c: Context<AppEnv>) => {
    return withSpan('EnrollmentHandler.update', async () => {
      const id = c.req.param('id') ?? ''
      const user = c.get('user')
      const body = c.get('body')

      const payload: Entity.UpdateEnrollmentReq = {
        ...body,
        id,
        company_id: user?.company_id || '',
        next_billing_date: body.next_payment_date,
        user,
      }

      const data = await usecase.update(payload)
      return c.json(responseSuccess(data, 'Enrollment updated successfully'))
    })
  }
}
