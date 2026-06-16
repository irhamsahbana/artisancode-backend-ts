import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseError, responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { IBranchUsecase } from '@/contracts/branch.contract'

export function findBranchByIdHandler(usecase: IBranchUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = getUserContext()
    const companyId = user?.company_id || ''

    const data = await usecase.findById(id, companyId)
    if (!data) {
      return c.json(responseError('Branch not found'), 404)
    }
    return c.json(responseSuccess(data))
  }
}
