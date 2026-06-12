import { Context } from 'hono'

import { responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import { IProgramUsecase } from '@/contracts/program.contract'

export function deletePricingHandler(usecase: IProgramUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const pricingId = c.req.param('pricingId') ?? ''
    const user = c.get('user')

    await usecase.deletePricing(id, pricingId, user?.company_id || '')
    return c.json(responseSuccess(null, 'Pricing deleted successfully'))
  }
}
