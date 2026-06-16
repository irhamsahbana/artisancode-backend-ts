import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { IActivityLogUsecase } from '@/contracts/activity_log.contract'
import * as Entity from '@/entities/activity_log.entity'

export function createActivityLogHandler(usecase: IActivityLogUsecase) {
  return async (c: Context<AppEnv>) => {
    const body = c.get('body')
    const user = getUserContext()
    const companyId = user?.company_id || ''

    const payload: Entity.CreateActivityLogReq = {
      company_id: companyId,
      branch_id: body.branch_id,
      user_id: body.user_id,
      entity_name: body.entity_name,
      entity_id: body.entity_id,
      activity: body.activity,
      before: body.before,
      after: body.after,
    }

    const data = await usecase.create(payload)
    return c.json(responseSuccess(data))
  }
}
