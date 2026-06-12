import { Context } from 'hono'

import { responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import { IEnrollmentUsecase } from '@/contracts/enrollment.contract'
import * as Entity from '@/entities/enrollment.entity'
import { withSpan } from '@/telemetry'

export function generateEnrollmentInvoiceHandler(usecase: IEnrollmentUsecase) {
  return async (c: Context<AppEnv>) => {
    return withSpan('enrollment.handler', 'EnrollmentHandler.generateInvoice', async () => {
      const id = c.req.param('id') ?? ''
      const user = c.get('user')

      const payload: Entity.GenerateEnrollmentInvoiceReq = {
        id,
        company_id: user?.company_id || '',
        user,
      }

      const data = await usecase.generateInvoice(payload)
      return c.json(responseSuccess(data, 'Invoice generated successfully'), 201)
    })
  }
}
