import { Context } from 'hono'

import { responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import { ICompanyUsecase } from '@/contracts/company.contract'
import * as Entity from '@/entities/company.entity'

export function updateCompanyHandler(usecase: ICompanyUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id')
    const user = c.get('user')
    const companyId = user?.company_id || ''
    const body = c.get('body')

    const payload: Entity.UpdateCompanyReq = { ...body, id, user }
    if (companyId) {
      payload.accessible_company_id = companyId
    }

    const data = await usecase.update(payload)
    return c.json(responseSuccess(data, 'Company updated successfully'))
  }
}
