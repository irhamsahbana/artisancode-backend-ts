import { IBranchRepo, IBranchUsecase } from '@/contracts/branch.contract'
import { withSpan } from '@/telemetry'

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
      withSpan('branch.usecase', 'BranchUsecase.create', () => createBranch(deps, req)),
    update: (req) =>
      withSpan('branch.usecase', 'BranchUsecase.update', () => updateBranch(deps, req)),
    delete: (id, companyId) =>
      withSpan('branch.usecase', 'BranchUsecase.delete', () => deleteBranch(deps, id, companyId)),
    findById: (id, companyId) =>
      withSpan('branch.usecase', 'BranchUsecase.findById', () => findBranchById(deps, id, companyId)),
    findList: (req) =>
      withSpan('branch.usecase', 'BranchUsecase.findList', () => findBranchList(deps, req)),
  }
}

export default createBranchUsecase
