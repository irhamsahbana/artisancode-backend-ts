import { AppError, ErrorCode } from '@/common/packages/types'
import * as Entity from '@/entities/category.entity'

import { CategoryUsecaseDeps } from '../category.usecase'

export async function updateCategory(
  deps: CategoryUsecaseDeps,
  req: Entity.UpdateCategoryReq,
): Promise<Entity.Category> {
  const category = await deps.repo.findById(req.id, req.company_id)
  if (!category) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Category not found')
  }

  if (req.parent_id) {
    if (req.parent_id === req.id) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Category cannot be its own parent')
    }
    const parent = await deps.repo.findById(req.parent_id, req.company_id)
    if (!parent) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Parent category not found')
    }
  }

  return deps.repo.update(req)
}
