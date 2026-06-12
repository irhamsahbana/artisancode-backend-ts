import * as Entity from '@/entities/branch.entity'

import { BranchUsecaseDeps } from '../branch.usecase'

export async function findBranchList(
  deps: BranchUsecaseDeps,
  req: Entity.GetBranchReq,
): Promise<Entity.BranchList> {
  return deps.repo.findList(req)
}
