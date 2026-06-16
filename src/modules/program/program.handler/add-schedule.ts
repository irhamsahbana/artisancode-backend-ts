import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { IProgramUsecase } from '@/contracts/program.contract'
import * as Entity from '@/entities/program.entity'

export function addScheduleHandler(usecase: IProgramUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = getUserContext()
    const body = c.get('body')
    const payload = body as Entity.AddScheduleReq

    payload.program_id = id
    payload.company_id = user?.company_id || ''

    const data = await usecase.addSchedule(payload)
    return c.json(responseSuccess(data, 'Schedule added successfully'), 201)
  }
}
