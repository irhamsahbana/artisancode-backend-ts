import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseError, responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { IProgramUsecase } from '@/contracts/program.contract'

export function findProgramByIdHandler(usecase: IProgramUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = getUserContext()

    const data = await usecase.findById(id, user?.company_id || '')
    if (!data) {
      return c.json(responseError('Program not found'), 404)
    }
    return c.json(responseSuccess(data))
  }
}
