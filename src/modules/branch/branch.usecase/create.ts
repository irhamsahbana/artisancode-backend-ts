import * as Entity from '@/entities/branch.entity'

import { BranchUsecaseDeps } from '../branch.usecase'

export async function createBranch(
  deps: BranchUsecaseDeps,
  req: Entity.CreateBranchReq,
): Promise<Entity.Branch> {
  return deps.repo.create(req)
}
