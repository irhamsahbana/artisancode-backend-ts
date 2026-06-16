import { Context } from 'hono'

import { withSpan } from '@/common/packages/observability'
import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { IEnrollmentUsecase } from '@/contracts/enrollment.contract'
import * as Entity from '@/entities/enrollment.entity'

export function createEnrollmentHandler(usecase: IEnrollmentUsecase) {
  return async (c: Context<AppEnv>) => {
    return withSpan('EnrollmentHandler.create', async () => {
      const user = c.get('user')
      const body = c.get('body')
      const payload: Entity.CreateEnrollmentReq = {
        ...body,
        company_id: user?.company_id || '',
        next_billing_date: body.next_payment_date,
        user,
      }

      const data = await usecase.create(payload)
      return c.json(responseSuccess(data, 'Enrollment created successfully'), 201)
    })
  }
}
