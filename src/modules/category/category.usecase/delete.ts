import { AppError } from '@/common/app_error'

import { CategoryUsecaseDeps } from '../category.usecase'

export async function deleteCategory(
  deps: CategoryUsecaseDeps,
  id: string,
  companyId: string,
): Promise<void> {
  const category = await deps.repo.findById(id, companyId)
  if (!category) {
    throw new AppError(404, 'Category not found')
  }
  return deps.repo.delete(id, companyId)
}
