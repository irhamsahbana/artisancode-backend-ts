import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'
import { ICategoryUsecase } from '@/contracts/category.contract'

export function deleteCategoryHandler(usecase: ICategoryUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = getUserContext()
    const companyId = user?.company_id || ''

    await usecase.delete(id, companyId)
    return c.json(responseSuccess(null, 'Category deleted successfully'))
  }
}
