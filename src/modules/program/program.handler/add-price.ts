import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { IProgramUsecase } from '@/contracts/program.contract'
import * as Entity from '@/entities/program.entity'

export function addPriceHandler(usecase: IProgramUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const pricingId = c.req.param('pricingId') ?? ''
    const user = getUserContext()
    const body = c.get('body')
    const payload = body as Entity.AddPriceReq

    payload.program_id = id
    payload.pricing_id = pricingId
    payload.company_id = user?.company_id || ''

    const data = await usecase.addPrice(payload)
    return c.json(responseSuccess(data, 'Price added successfully'), 201)
  }
}
