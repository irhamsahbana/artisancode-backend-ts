import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { ICategoryUsecase } from '@/contracts/category.contract'
import * as Entity from '@/entities/category.entity'

export function createCategoryHandler(usecase: ICategoryUsecase) {
  return async (c: Context<AppEnv>) => {
    const user = getUserContext()
    const companyId = user?.company_id || ''
    const body = c.get('body')
    const payload: Entity.CreateCategoryReq = {
      ...body,
      company_id: companyId,
    }

    const data = await usecase.create(payload)
    return c.json(responseSuccess(data, 'Category created successfully'), 201)
  }
}
