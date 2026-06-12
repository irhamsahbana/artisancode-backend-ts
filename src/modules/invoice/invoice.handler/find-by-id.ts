import { Context } from 'hono'

import { responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import { IInvoiceUsecase } from '@/contracts/invoice.contract'
import { withSpan } from '@/telemetry'

export function findInvoiceByIdHandler(usecase: IInvoiceUsecase) {
  return async (c: Context<AppEnv>) => {
    return withSpan('invoice.handler', 'InvoiceHandler.findById', async () => {
      const user = c.get('user')
      const result = await usecase.findById(c.req.param('id') ?? '', user?.company_id || '')
      return c.json(responseSuccess(result))
    })
  }
}
