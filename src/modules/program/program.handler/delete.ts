import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { IProgramUsecase } from '@/contracts/program.contract'

export function deleteProgramHandler(usecase: IProgramUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = getUserContext()

    await usecase.delete(id, user?.company_id || '')
    return c.json(responseSuccess(null, 'Program deleted successfully'))
  }
}
