import { Context } from 'hono'

import { responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import { IActivityLogUsecase } from '@/contracts/activity_log.contract'

export function findActivityLogByIdHandler(usecase: IActivityLogUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') || ''
    const user = c.get('user')
    const companyId = user?.company_id || ''

    const data = await usecase.findById(id, companyId)
    return c.json(responseSuccess(data))
  }
}
