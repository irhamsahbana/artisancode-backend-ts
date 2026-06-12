import { ICategoryUsecase } from '@/contracts/category.contract'

import { createCategoryHandler } from './create'
import { deleteCategoryHandler } from './delete'
import { findCategoryByIdHandler } from './find-by-id'
import { findCategoryListHandler } from './find-list'
import { updateCategoryHandler } from './update'

export function createCategoryHandlerDeps(usecase: ICategoryUsecase) {
  return {
    create: createCategoryHandler(usecase),
    update: updateCategoryHandler(usecase),
    delete: deleteCategoryHandler(usecase),
    findById: findCategoryByIdHandler(usecase),
    findList: findCategoryListHandler(usecase),
  }
}
