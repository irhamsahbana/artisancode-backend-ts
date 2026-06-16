import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { IProgramUsecase } from '@/contracts/program.contract'

export function deleteProgramHandler(usecase: IProgramUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')

    await usecase.delete(id, user?.company_id || '')
    return c.json(responseSuccess(null, 'Program deleted successfully'))
  }
}
