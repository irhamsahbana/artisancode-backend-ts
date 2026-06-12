import { Context } from 'hono'

import { responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import { IUserUsecase } from '@/contracts/user.contract'
import * as Entity from '@/entities/user.entity'

export function registerUserHandler(usecase: IUserUsecase) {
  return async (c: Context<AppEnv>) => {
    const body = c.get('body')
    const payload = body as Entity.RegisterReq
    const data = await usecase.register(payload)
    return c.json(responseSuccess(data, 'Company registered successfully'), 201)
  }
}
