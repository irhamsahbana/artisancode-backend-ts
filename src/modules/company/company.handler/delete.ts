import { Context } from 'hono'

import { responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import { ICompanyUsecase } from '@/contracts/company.contract'
import * as Entity from '@/entities/company.entity'

export function deleteCompanyHandler(usecase: ICompanyUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id')
    const user = c.get('user')
    const companyId = user?.company_id || ''

    const payload: Entity.GetCompanyReq = { id, user }
    if (companyId) {
      payload.accessible_company_id = companyId
    }

    await usecase.delete(payload)
    return c.json(responseSuccess(null, 'Company deleted successfully'))
  }
}
