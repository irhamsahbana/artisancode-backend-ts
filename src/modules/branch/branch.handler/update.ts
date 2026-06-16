import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { IBranchUsecase } from '@/contracts/branch.contract'
import * as Entity from '@/entities/branch.entity'

export function updateBranchHandler(usecase: IBranchUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = getUserContext()
    const companyId = user?.company_id || ''
    const body = c.get('body')

    const payload: Entity.UpdateBranchReq = {
      ...body,
      id,
      company_id: companyId,
    }

    const data = await usecase.update(payload)
    return c.json(responseSuccess(data, 'Branch updated successfully'))
  }
}
