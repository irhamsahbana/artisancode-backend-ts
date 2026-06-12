import { Context } from 'hono'

import { responseError, responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import { ICategoryUsecase } from '@/contracts/category.contract'

export function findCategoryByIdHandler(usecase: ICategoryUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')
    const companyId = user?.company_id || ''

    const data = await usecase.findById(id, companyId)
    if (!data) {
      return c.json(responseError('Category not found'), 404)
    }
    return c.json(responseSuccess(data))
  }
}
