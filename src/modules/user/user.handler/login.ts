import { Context } from 'hono'

import { AppEnv, ErrorCode } from '@/common/packages/types'
import { responseError, responseSuccess } from '@/common/rest_response'
import { IUserUsecase } from '@/contracts/user.contract'
import * as Entity from '@/entities/user.entity'

export function loginUserHandler(usecase: IUserUsecase) {
  return async (c: Context<AppEnv>) => {
    const body = c.get('body')
    const payload = body as Entity.LoginReq
    const data = await usecase.login(payload)
    if (!data) {
      return c.json(responseError('Invalid credentials', undefined, ErrorCode.AUTH_INVALID_CREDENTIALS), 401)
    }
    return c.json(responseSuccess(data, 'Login successful'))
  }
}
