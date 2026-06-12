import { Context } from 'hono'

import { responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import { IStudentUsecase } from '@/contracts/student.contract'

export function deleteStudentHandler(usecase: IStudentUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')

    await usecase.delete(id, user?.company_id || '')
    return c.json(responseSuccess(null, 'Student deleted successfully'))
  }
}
