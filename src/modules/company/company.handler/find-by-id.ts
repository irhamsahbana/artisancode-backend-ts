import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { ICompanyUsecase } from '@/contracts/company.contract'
import * as Entity from '@/entities/company.entity'

export function findCompanyByIdHandler(usecase: ICompanyUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id')
    const user = getUserContext()
    const companyId = user?.company_id || ''

    const payload: Entity.GetCompanyReq = { id }
    if (companyId) {
      payload.accessible_company_id = companyId
    }

    const data = await usecase.findById(payload)
    if (!data) {
      return c.json(responseSuccess(null, 'Company not found'), 404)
    }
    return c.json(responseSuccess(data))
  }
}
