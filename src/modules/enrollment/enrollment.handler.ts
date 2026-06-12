import { Context } from 'hono'

import { responseError, responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import * as Entity from '@/entities/enrollment.entity'
import { withSpan } from '@/telemetry'

import { IEnrollmentUsecase } from './enrollment.contract'

export default class EnrollmentHandler {
  constructor(private usecase: IEnrollmentUsecase) {}

  create = async (c: Context<AppEnv>) => {
    return withSpan('enrollment.handler', 'EnrollmentHandler.create', async () => {
      const user = c.get('user')
      const body = c.get('body')
      const payload: Entity.CreateEnrollmentReq = {
        ...body,
        company_id: user?.company_id || '',
        next_billing_date: body.next_payment_date,
        user,
      }

      const data = await this.usecase.create(payload)
      return c.json(responseSuccess(data, 'Enrollment created successfully'), 201)
    })
  }

  update = async (c: Context<AppEnv>) => {
    return withSpan('enrollment.handler', 'EnrollmentHandler.update', async () => {
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

      const data = await this.usecase.update(payload)
      return c.json(responseSuccess(data, 'Enrollment updated successfully'))
    })
  }

  generateInvoice = async (c: Context<AppEnv>) => {
    return withSpan('enrollment.handler', 'EnrollmentHandler.generateInvoice', async () => {
      const id = c.req.param('id') ?? ''
      const user = c.get('user')

      const payload: Entity.GenerateEnrollmentInvoiceReq = {
        id,
        company_id: user?.company_id || '',
        user,
      }

      const data = await this.usecase.generateInvoice(payload)
      return c.json(responseSuccess(data, 'Invoice generated successfully'), 201)
    })
  }

  delete = async (c: Context<AppEnv>) => {
    return withSpan('enrollment.handler', 'EnrollmentHandler.delete', async () => {
      const id = c.req.param('id') ?? ''
      const user = c.get('user')

      await this.usecase.delete(id, user?.company_id || '')
      return c.json(responseSuccess(null, 'Enrollment deleted successfully'))
    })
  }

  findById = async (c: Context<AppEnv>) => {
    return withSpan('enrollment.handler', 'EnrollmentHandler.findById', async () => {
      const id = c.req.param('id') ?? ''
      const user = c.get('user')

      const data = await this.usecase.findById(id, user?.company_id || '')
      if (!data) {
        return c.json(responseError('Enrollment not found'), 404)
      }
      return c.json(responseSuccess(data))
    })
  }

  findList = async (c: Context<AppEnv>) => {
    return withSpan('enrollment.handler', 'EnrollmentHandler.findList', async () => {
      const query = c.get('body')?._query || c.req.query()
      const { page, limit, branch_id, student_id, program_id } = query as {
        page: number
        limit: number
        branch_id: string
        student_id: string
        program_id: string
      }
      const user = c.get('user')

      const payload: Entity.GetEnrollmentReq = {
        company_id: user?.company_id || '',
        branch_id,
        student_id,
        program_id,
        pagination: {
          page: Number(page) || 1,
          per_page: Number(limit) || 10,
        },
        user,
      }

      const data = await this.usecase.findList(payload)
      return c.json(responseSuccess(data))
    })
  }
}
