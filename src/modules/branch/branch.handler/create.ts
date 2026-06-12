import { Context } from 'hono'

import { responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import { IBranchUsecase } from '@/contracts/branch.contract'
import * as Entity from '@/entities/branch.entity'

export function createBranchHandler(usecase: IBranchUsecase) {
  return async (c: Context<AppEnv>) => {
    const user = c.get('user')
    const companyId = user?.company_id || ''
    const body = c.get('body')
    const payload: Entity.CreateBranchReq = {
      ...body,
      company_id: companyId,
      user,
    }

    const data = await usecase.create(payload)
    return c.json(responseSuccess(data, 'Branch created successfully'), 201)
  }
}
