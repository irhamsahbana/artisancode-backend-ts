import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { IProgramUsecase } from '@/contracts/program.contract'

export function deleteScheduleHandler(usecase: IProgramUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const scheduleId = c.req.param('scheduleId') ?? ''
    const user = c.get('user')

    await usecase.deleteSchedule(id, scheduleId, user?.company_id || '')
    return c.json(responseSuccess(null, 'Schedule deleted successfully'))
  }
}
