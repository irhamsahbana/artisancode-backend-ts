import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { ITeacherUsecase } from '@/contracts/teacher.contract'
import * as Entity from '@/entities/teacher.entity'

export function updateTeacherHandler(usecase: ITeacherUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')
    const body = c.get('body')
    const payload = body as Entity.UpdateTeacherReq

    payload.id = id
    payload.company_id = user?.company_id || ''
    payload.user = user

    const data = await usecase.update(payload)
    return c.json(responseSuccess(data, 'Teacher updated successfully'))
  }
}
