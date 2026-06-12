import { Context } from 'hono'

import { responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import { IProgramUsecase } from '@/contracts/program.contract'
import * as Entity from '@/entities/program.entity'

export function addPricingHandler(usecase: IProgramUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')
    const body = c.get('body')
    const payload = body as Entity.AddPricingReq

    payload.program_id = id
    payload.company_id = user?.company_id || ''
    payload.user = user

    const data = await usecase.addPricing(payload)
    return c.json(responseSuccess(data, 'Pricing added successfully'), 201)
  }
}
