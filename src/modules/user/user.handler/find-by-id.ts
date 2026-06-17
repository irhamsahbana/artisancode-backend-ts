import { Context } from 'hono'

import { AppEnv, ErrorCode } from '@/common/packages/types'
import { responseError, responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { IUserUsecase } from '@/contracts/user.contract'

export function findUserByIdHandler(usecase: IUserUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = getUserContext()
    const companyId = user?.company_id || ''

    const data = await usecase.findById(id, companyId)
    if (!data) {
      return c.json(responseError('User not found', undefined, ErrorCode.NOT_FOUND), 404)
    }
    return c.json(responseSuccess(data))
  }
}
