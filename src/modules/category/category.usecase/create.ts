import { AppError, ErrorCode } from '@/common/packages/types'
import * as Entity from '@/entities/category.entity'

import { CategoryUsecaseDeps } from '../category.usecase'

export async function createCategory(
  deps: CategoryUsecaseDeps,
  req: Entity.CreateCategoryReq,
): Promise<Entity.Category> {
  if (req.parent_id) {
    const parent = await deps.repo.findById(req.parent_id, req.company_id)
    if (!parent) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Parent category not found')
    }
  }
  return deps.repo.create(req)
}
