import { Context } from 'hono'

import { responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import { ITeacherUsecase } from '@/contracts/teacher.contract'
import * as Entity from '@/entities/teacher.entity'

export function createTeacherHandler(usecase: ITeacherUsecase) {
  return async (c: Context<AppEnv>) => {
    const user = c.get('user')
    const body = c.get('body')
    const payload = body as Entity.CreateTeacherReq
    payload.company_id = user?.company_id || ''
    payload.user = user

    const data = await usecase.create(payload)
    return c.json(responseSuccess(data, 'Teacher created successfully'), 201)
  }
}
