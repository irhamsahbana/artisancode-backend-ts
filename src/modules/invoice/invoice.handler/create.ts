import { Context } from 'hono'

import { withSpan } from '@/common/packages/observability'
import { responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import { IInvoiceUsecase } from '@/contracts/invoice.contract'
import * as Entity from '@/entities/invoice.entity'

export function createInvoiceHandler(usecase: IInvoiceUsecase) {
  return async (c: Context<AppEnv>) => {
    return withSpan('InvoiceHandler.create', async () => {
      const user = c.get('user')
      const body = c.get('body') as Entity.CreateInvoiceReq

      const payload: Entity.CreateInvoiceReq = {
        ...body,
        user,
      }

      payload.company_id = user?.company_id || ''
      if (user?.branch_id) {
        payload.branch_id = user.branch_id
      }

      const result = await usecase.create(payload)
      return c.json(responseSuccess(result))
    })
  }
}
