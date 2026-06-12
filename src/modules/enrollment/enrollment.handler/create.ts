import { Context } from 'hono'

import { responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import { IEnrollmentUsecase } from '@/contracts/enrollment.contract'
import * as Entity from '@/entities/enrollment.entity'
import { withSpan } from '@/telemetry'

export function createEnrollmentHandler(usecase: IEnrollmentUsecase) {
  return async (c: Context<AppEnv>) => {
    return withSpan('enrollment.handler', 'EnrollmentHandler.create', async () => {
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
