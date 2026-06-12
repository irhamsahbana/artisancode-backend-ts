import * as Entity from '@/entities/branch.entity'

import { BranchUsecaseDeps } from '../branch.usecase'

export async function findBranchById(
  deps: BranchUsecaseDeps,
  id: string,
  companyId: string,
): Promise<Entity.Branch | null> {
  return deps.repo.findById(id, companyId)
}
