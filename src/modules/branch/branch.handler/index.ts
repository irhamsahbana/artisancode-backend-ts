import { IBranchUsecase } from '@/contracts/branch.contract'

import { createBranchHandler } from './create'
import { deleteBranchHandler } from './delete'
import { findBranchByIdHandler } from './find-by-id'
import { findBranchListHandler } from './find-list'
import { updateBranchHandler } from './update'

export function createBranchHandlerDeps(usecase: IBranchUsecase) {
  return {
    create: createBranchHandler(usecase),
    update: updateBranchHandler(usecase),
    delete: deleteBranchHandler(usecase),
    findById: findBranchByIdHandler(usecase),
    findList: findBranchListHandler(usecase),
  }
}
