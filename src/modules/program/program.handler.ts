import { Context } from 'hono'

import { responseError, responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import * as Entity from '@/entities/program.entity'

import { IProgramUsecase } from './program.contract'

export default class ProgramHandler {
  constructor(private usecase: IProgramUsecase) {}

  create = async (c: Context<AppEnv>) => {
    const user = c.get('user')
    const body = c.get('body')
    const payload = body as Entity.CreateProgramReq
    payload.company_id = user?.company_id || ''
    payload.user = user

    const data = await this.usecase.create(payload)
    return c.json(responseSuccess(data, 'Program created successfully'), 201)
  }

  update = async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')
    const body = c.get('body')
    const payload = body as Entity.UpdateProgramReq

    payload.id = id
    payload.company_id = user?.company_id || ''
    payload.user = user

    const data = await this.usecase.update(payload)
    return c.json(responseSuccess(data, 'Program updated successfully'))
  }

  updateAll = async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')
    const body = c.get('body')
    const payload = body as Entity.UpdateProgramAllReq

    payload.id = id
    payload.company_id = user?.company_id || ''
    payload.user = user

    const data = await this.usecase.updateAll(payload)
    return c.json(responseSuccess(data, 'Program updated successfully'))
  }

  delete = async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')

    await this.usecase.delete(id, user?.company_id || '')
    return c.json(responseSuccess(null, 'Program deleted successfully'))
  }

  findById = async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')

    const data = await this.usecase.findById(id, user?.company_id || '')
    if (!data) {
      return c.json(responseError('Program not found'), 404)
    }
    return c.json(responseSuccess(data))
  }

  findList = async (c: Context<AppEnv>) => {
    const query = c.get('body')?._query || c.req.query()
    const { page, limit, q, branch_id } = query as {
      page: number
      limit: number
      q: string
      branch_id: string
    }
    const user = c.get('user')

    const payload: Entity.GetProgramReq = {
      company_id: user?.company_id || '',
      q,
      branch_id,
      pagination: {
        page: Number(page) || 1,
        per_page: Number(limit) || 10,
      },
      user,
    }

    const data = await this.usecase.findList(payload)
    return c.json(responseSuccess(data))
  }

  addSchedule = async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')
    const body = c.get('body')
    const payload = body as Entity.AddScheduleReq

    payload.program_id = id
    payload.company_id = user?.company_id || ''
    payload.user = user

    const data = await this.usecase.addSchedule(payload)
    return c.json(responseSuccess(data, 'Schedule added successfully'), 201)
  }

  addPricing = async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')
    const body = c.get('body')
    const payload = body as Entity.AddPricingReq

    payload.program_id = id
    payload.company_id = user?.company_id || ''
    payload.user = user

    const data = await this.usecase.addPricing(payload)
    return c.json(responseSuccess(data, 'Pricing added successfully'), 201)
  }

  addPrice = async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const pricingId = c.req.param('pricingId') ?? ''
    const user = c.get('user')
    const body = c.get('body')
    const payload = body as Entity.AddPriceReq

    payload.program_id = id
    payload.pricing_id = pricingId
    payload.company_id = user?.company_id || ''

    const data = await this.usecase.addPrice(payload)
    return c.json(responseSuccess(data, 'Price added successfully'), 201)
  }

  updatePrice = async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const pricingId = c.req.param('pricingId') ?? ''
    const priceId = c.req.param('priceId') ?? ''
    const user = c.get('user')
    const body = c.get('body')
    const payload = body as Entity.UpdatePriceReq

    payload.program_id = id
    payload.pricing_id = pricingId
    payload.price_id = priceId
    payload.company_id = user?.company_id || ''

    const data = await this.usecase.updatePrice(payload)
    return c.json(responseSuccess(data, 'Price updated successfully'))
  }

  deleteSchedule = async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const scheduleId = c.req.param('scheduleId') ?? ''
    const user = c.get('user')

    await this.usecase.deleteSchedule(id, scheduleId, user?.company_id || '')
    return c.json(responseSuccess(null, 'Schedule deleted successfully'))
  }

  deletePricing = async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const pricingId = c.req.param('pricingId') ?? ''
    const user = c.get('user')

    await this.usecase.deletePricing(id, pricingId, user?.company_id || '')
    return c.json(responseSuccess(null, 'Pricing deleted successfully'))
  }
}
