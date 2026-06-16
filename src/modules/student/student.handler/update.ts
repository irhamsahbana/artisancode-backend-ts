import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { IStudentUsecase } from '@/contracts/student.contract'
import * as Entity from '@/entities/student.entity'

export function updateStudentHandler(usecase: IStudentUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = getUserContext()
    const body = c.get('body')
    const payload = body as Entity.UpdateStudentReq

    payload.id = id
    payload.company_id = user?.company_id || ''

    const data = await usecase.update(payload)
    return c.json(responseSuccess(data, 'Student updated successfully'))
  }
}
