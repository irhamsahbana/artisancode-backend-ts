import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { IProgramUsecase } from '@/contracts/program.contract'
import * as Entity from '@/entities/program.entity'

export function createProgramHandler(usecase: IProgramUsecase) {
  return async (c: Context<AppEnv>) => {
    const user = c.get('user')
    const body = c.get('body')
    const payload = body as Entity.CreateProgramReq
    payload.company_id = user?.company_id || ''
    payload.user = user

    const data = await usecase.create(payload)
    return c.json(responseSuccess(data, 'Program created successfully'), 201)
  }
}
