import { Context } from 'hono'

import { withSpan } from '@/common/packages/observability'
import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { IInvoiceUsecase } from '@/contracts/invoice.contract'

export function findInvoiceByIdHandler(usecase: IInvoiceUsecase) {
  return async (c: Context<AppEnv>) => {
    return withSpan('InvoiceHandler.findById', async () => {
      const user = c.get('user')
      const result = await usecase.findById(c.req.param('id') ?? '', user?.company_id || '')
      return c.json(responseSuccess(result))
    })
  }
}
