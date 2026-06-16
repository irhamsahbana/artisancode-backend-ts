import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { ICompanyUsecase } from '@/contracts/company.contract'
import * as Entity from '@/entities/company.entity'

export function createCompanyHandler(usecase: ICompanyUsecase) {
  return async (c: Context<AppEnv>) => {
    const body = c.get('body')
    const payload: Entity.CreateCompanyReq = {
      ...body,
    }
    const data = await usecase.create(payload)
    return c.json(responseSuccess(data, 'Company created successfully'), 201)
  }
}
