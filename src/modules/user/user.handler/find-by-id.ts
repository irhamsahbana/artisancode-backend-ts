import { Context } from 'hono'

import { responseError, responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import { IUserUsecase } from '@/contracts/user.contract'

export function findUserByIdHandler(usecase: IUserUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')
    const companyId = user?.company_id || ''

    const data = await usecase.findById(id, companyId)
    if (!data) {
      return c.json(responseError('User not found'), 404)
    }
    return c.json(responseSuccess(data))
  }
}
