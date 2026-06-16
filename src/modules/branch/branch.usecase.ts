import { withSpan } from '@/common/packages/observability'
import { IBranchRepo, IBranchUsecase } from '@/contracts/branch.contract'

import { createBranch } from './branch.usecase/create'
import { deleteBranch } from './branch.usecase/delete'
import { findBranchById } from './branch.usecase/find-by-id'
import { findBranchList } from './branch.usecase/find-list'
import { updateBranch } from './branch.usecase/update'

export interface BranchUsecaseDeps {
  repo: IBranchRepo
}

export function createBranchUsecase(repo: IBranchRepo): IBranchUsecase {
  const deps: BranchUsecaseDeps = { repo }

  return {
    create: (req) =>
      withSpan('BranchUsecase.create', () => createBranch(deps, req)),
    update: (req) =>
      withSpan('BranchUsecase.update', () => updateBranch(deps, req)),
    delete: (id, companyId) => deleteBranch(deps, id, companyId),
    findById: (id, companyId) => findBranchById(deps, id, companyId),
    findList: (req) => findBranchList(deps, req),
  }
}

export default createBranchUsecase
