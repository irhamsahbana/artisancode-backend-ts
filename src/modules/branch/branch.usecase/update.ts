import { AppError } from '@/common/app_error'
import * as Entity from '@/entities/branch.entity'

import { BranchUsecaseDeps } from '../branch.usecase'

export async function updateBranch(
  deps: BranchUsecaseDeps,
  req: Entity.UpdateBranchReq,
): Promise<Entity.Branch> {
  const branch = await deps.repo.findById(req.id, req.company_id)
  if (!branch) {
    throw new AppError(404, 'Branch not found')
  }
  return deps.repo.update(req)
}
