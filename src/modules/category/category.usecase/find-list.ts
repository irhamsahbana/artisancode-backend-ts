import * as Entity from '@/entities/category.entity'

import { CategoryUsecaseDeps } from '../category.usecase'

export async function findCategoryList(
  deps: CategoryUsecaseDeps,
  req: Entity.GetCategoryReq,
): Promise<Entity.CategoryList> {
  return deps.repo.findList(req)
}
