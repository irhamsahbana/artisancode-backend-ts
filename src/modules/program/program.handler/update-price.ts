import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { IProgramUsecase } from '@/contracts/program.contract'
import * as Entity from '@/entities/program.entity'

export function updatePriceHandler(usecase: IProgramUsecase) {
  return async (c: Context<AppEnv>) => {
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

    const data = await usecase.updatePrice(payload)
    return c.json(responseSuccess(data, 'Price updated successfully'))
  }
}
