import { Context } from 'hono'

import { responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import { ICategoryUsecase } from '@/contracts/category.contract'
import * as Entity from '@/entities/category.entity'

export function createCategoryHandler(usecase: ICategoryUsecase) {
  return async (c: Context<AppEnv>) => {
    const user = c.get('user')
    const companyId = user?.company_id || ''
    const body = c.get('body')
    const payload: Entity.CreateCategoryReq = {
      ...body,
      company_id: companyId,
      user,
    }

    const data = await usecase.create(payload)
    return c.json(responseSuccess(data, 'Category created successfully'), 201)
  }
}
