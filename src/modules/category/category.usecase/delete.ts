import { AppError, ErrorCode } from '@/common/packages/types'

import { CategoryUsecaseDeps } from '../category.usecase'

export async function deleteCategory(
  deps: CategoryUsecaseDeps,
  id: string,
  companyId: string,
): Promise<void> {
  const category = await deps.repo.findById(id, companyId)
  if (!category) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Category not found')
  }
  return deps.repo.delete(id, companyId)
}
