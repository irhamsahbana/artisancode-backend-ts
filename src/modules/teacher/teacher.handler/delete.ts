import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { ITeacherUsecase } from '@/contracts/teacher.contract'

export function deleteTeacherHandler(usecase: ITeacherUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = getUserContext()

    await usecase.delete(id, user?.company_id || '')
    return c.json(responseSuccess(null, 'Teacher deleted successfully'))
  }
}
