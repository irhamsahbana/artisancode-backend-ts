import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseError, responseSuccess } from '@/common/rest_response'
import { ITeacherUsecase } from '@/contracts/teacher.contract'

export function findTeacherByIdHandler(usecase: ITeacherUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')

    const data = await usecase.findById(id, user?.company_id || '')
    if (!data) {
      return c.json(responseError('Teacher not found'), 404)
    }
    return c.json(responseSuccess(data))
  }
}
