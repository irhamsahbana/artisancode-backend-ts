import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { ITeacherUsecase } from '@/contracts/teacher.contract'

export function deleteTeacherHandler(usecase: ITeacherUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')

    await usecase.delete(id, user?.company_id || '')
    return c.json(responseSuccess(null, 'Teacher deleted successfully'))
  }
}
