import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { IBranchUsecase } from '@/contracts/branch.contract'

export function deleteBranchHandler(usecase: IBranchUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = getUserContext()
    const companyId = user?.company_id || ''

    await usecase.delete(id, companyId)
    return c.json(responseSuccess(null, 'Branch deleted successfully'))
  }
}
