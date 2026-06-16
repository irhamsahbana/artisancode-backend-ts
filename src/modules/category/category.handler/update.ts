import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { ICategoryUsecase } from '@/contracts/category.contract'
import * as Entity from '@/entities/category.entity'

export function updateCategoryHandler(usecase: ICategoryUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = getUserContext()
    const companyId = user?.company_id || ''
    const body = c.get('body')

    const payload: Entity.UpdateCategoryReq = {
      ...body,
      id,
      company_id: companyId,
    }

    const data = await usecase.update(payload)
    return c.json(responseSuccess(data, 'Category updated successfully'))
  }
}
