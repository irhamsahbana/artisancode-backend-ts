import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { IUserUsecase } from '@/contracts/user.contract'
import * as Entity from '@/entities/user.entity'

export function createUserHandler(usecase: IUserUsecase) {
  return async (c: Context<AppEnv>) => {
    const body = c.get('body')
    const payload = body as Entity.CreateUserReq
    const user = getUserContext()
    const companyId = user?.company_id || ''

    if (companyId) {
      payload.company_id = companyId
    }

    const data = await usecase.create(payload)
    return c.json(responseSuccess(data, 'User created successfully'), 201)
  }
}
