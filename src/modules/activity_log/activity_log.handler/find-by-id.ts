import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { IActivityLogUsecase } from '@/contracts/activity_log.contract'

export function findActivityLogByIdHandler(usecase: IActivityLogUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') || ''
    const user = getUserContext()
    const companyId = user?.company_id || ''

    const data = await usecase.findById(id, companyId)
    return c.json(responseSuccess(data))
  }
}
