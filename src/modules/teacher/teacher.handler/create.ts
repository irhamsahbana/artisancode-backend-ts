import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { ITeacherUsecase } from '@/contracts/teacher.contract'
import * as Entity from '@/entities/teacher.entity'

export function createTeacherHandler(usecase: ITeacherUsecase) {
  return async (c: Context<AppEnv>) => {
    const user = getUserContext()
    const body = c.get('body')
    const payload = body as Entity.CreateTeacherReq
    payload.company_id = user?.company_id || ''

    const data = await usecase.create(payload)
    return c.json(responseSuccess(data, 'Teacher created successfully'), 201)
  }
}
