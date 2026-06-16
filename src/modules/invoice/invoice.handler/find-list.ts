import { Context } from 'hono'

import { withSpan } from '@/common/packages/observability'
import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { IInvoiceUsecase } from '@/contracts/invoice.contract'
import * as Entity from '@/entities/invoice.entity'

export function findInvoiceListHandler(usecase: IInvoiceUsecase) {
  return async (c: Context<AppEnv>) => {
    return withSpan('InvoiceHandler.findList', async () => {
      const query = c.get('body')?._query || c.req.query()
      const { page, limit, enrollment_id, status } = query as {
        page: number
        limit: number
        enrollment_id: string
        status: string
      }
      const user = c.get('user')

      const payload: Entity.GetInvoiceReq = {
        company_id: user?.company_id || '',
        enrollment_id,
        status,
        pagination: {
          page: Number(page) || 1,
          per_page: Number(limit) || 10,
        },
        user,
      }

      const result = await usecase.findList(payload)
      return c.json(responseSuccess(result))
    })
  }
}
