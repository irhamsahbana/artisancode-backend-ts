import { Context } from 'hono'

import { responseError, responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import { IProgramUsecase } from '@/contracts/program.contract'

export function findProgramByIdHandler(usecase: IProgramUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')

    const data = await usecase.findById(id, user?.company_id || '')
    if (!data) {
      return c.json(responseError('Program not found'), 404)
    }
    return c.json(responseSuccess(data))
  }
}
