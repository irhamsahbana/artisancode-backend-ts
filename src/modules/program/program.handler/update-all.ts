import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { IProgramUsecase } from '@/contracts/program.contract'
import * as Entity from '@/entities/program.entity'

export function updateAllProgramHandler(usecase: IProgramUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')
    const body = c.get('body')
    const payload = body as Entity.UpdateProgramAllReq

    payload.id = id
    payload.company_id = user?.company_id || ''
    payload.user = user

    const data = await usecase.updateAll(payload)
    return c.json(responseSuccess(data, 'Program updated successfully'))
  }
}
