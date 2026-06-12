import { Context } from 'hono'

import { responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import * as Entity from '@/entities/invoice.entity'
import { withSpan } from '@/telemetry'

import { IInvoiceUsecase } from './invoice.contract'

export default class InvoiceHandler {
  constructor(private usecase: IInvoiceUsecase) {}

  create = async (c: Context<AppEnv>) => {
    return withSpan('invoice.handler', 'InvoiceHandler.create', async () => {
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

      const result = await this.usecase.create(payload)
      return c.json(responseSuccess(result))
    })
  }

  findById = async (c: Context<AppEnv>) => {
    return withSpan('invoice.handler', 'InvoiceHandler.findById', async () => {
      const user = c.get('user')
      const result = await this.usecase.findById(c.req.param('id') ?? '', user?.company_id || '')
      return c.json(responseSuccess(result))
    })
  }

  findList = async (c: Context<AppEnv>) => {
    return withSpan('invoice.handler', 'InvoiceHandler.findList', async () => {
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

      const result = await this.usecase.findList(payload)
      return c.json(responseSuccess(result))
    })
  }
}
