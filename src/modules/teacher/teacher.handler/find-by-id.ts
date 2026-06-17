import { Context } from 'hono'

import { AppEnv, ErrorCode } from '@/common/packages/types'
import { responseError, responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { ITeacherUsecase } from '@/contracts/teacher.contract'

export function findTeacherByIdHandler(usecase: ITeacherUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = getUserContext()

    const data = await usecase.findById(id, user?.company_id || '')
    if (!data) {
      return c.json(responseError('Teacher not found', undefined, ErrorCode.NOT_FOUND), 404)
    }
    return c.json(responseSuccess(data))
  }
}
