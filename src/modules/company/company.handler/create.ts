import { Context } from 'hono'

import { responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import { ICompanyUsecase } from '@/contracts/company.contract'
import * as Entity from '@/entities/company.entity'

export function createCompanyHandler(usecase: ICompanyUsecase) {
  return async (c: Context<AppEnv>) => {
    const user = c.get('user')
    const body = c.get('body')
    const payload: Entity.CreateCompanyReq = {
      ...body,
      user,
    }
    const data = await usecase.create(payload)
    return c.json(responseSuccess(data, 'Company created successfully'), 201)
  }
}
