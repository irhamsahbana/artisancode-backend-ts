import { ICategoryRepo, ICategoryUsecase } from '@/contracts/category.contract'
import { withSpan } from '@/telemetry'

import { createCategory } from './category.usecase/create'
import { deleteCategory } from './category.usecase/delete'
import { findCategoryById } from './category.usecase/find-by-id'
import { findCategoryList } from './category.usecase/find-list'
import { updateCategory } from './category.usecase/update'

export interface CategoryUsecaseDeps {
  repo: ICategoryRepo
}

export function createCategoryUsecase(repo: ICategoryRepo): ICategoryUsecase {
  const deps: CategoryUsecaseDeps = { repo }

  return {
    create: (req) =>
      withSpan('category.usecase', 'CategoryUsecase.create', () => createCategory(deps, req)),
    update: (req) =>
      withSpan('category.usecase', 'CategoryUsecase.update', () => updateCategory(deps, req)),
    delete: (id, companyId) => deleteCategory(deps, id, companyId),
    findById: (id, companyId) => findCategoryById(deps, id, companyId),
    findList: (req) => findCategoryList(deps, req),
  }
}

export default createCategoryUsecase
