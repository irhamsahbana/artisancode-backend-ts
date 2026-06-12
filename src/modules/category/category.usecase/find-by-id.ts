import * as Entity from '@/entities/category.entity'

import { CategoryUsecaseDeps } from '../category.usecase'

export async function findCategoryById(
  deps: CategoryUsecaseDeps,
  id: string,
  companyId: string,
): Promise<Entity.Category | null> {
  return deps.repo.findById(id, companyId)
}
