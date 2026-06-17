import { Context } from 'hono'

import { AppEnv, ErrorCode } from '@/common/packages/types'
import { responseError, responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { IStudentUsecase } from '@/contracts/student.contract'

export function findStudentByIdHandler(usecase: IStudentUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = getUserContext()

    const data = await usecase.findById(id, user?.company_id || '')
    if (!data) {
      return c.json(responseError('Student not found', undefined, ErrorCode.NOT_FOUND), 404)
    }
    return c.json(responseSuccess(data))
  }
}
