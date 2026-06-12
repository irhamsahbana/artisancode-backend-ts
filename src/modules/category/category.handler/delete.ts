import { Context } from 'hono'

import { responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import { ICategoryUsecase } from '@/contracts/category.contract'

export function deleteCategoryHandler(usecase: ICategoryUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')
    const companyId = user?.company_id || ''

    await usecase.delete(id, companyId)
    return c.json(responseSuccess(null, 'Category deleted successfully'))
  }
}
