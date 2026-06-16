import { AppError, ErrorCode } from '@/common/packages/types'
import * as Entity from '@/entities/branch.entity'

import { BranchUsecaseDeps } from '../branch.usecase'

export async function updateBranch(
  deps: BranchUsecaseDeps,
  req: Entity.UpdateBranchReq,
): Promise<Entity.Branch> {
  const branch = await deps.repo.findById(req.id, req.company_id)
  if (!branch) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Branch not found')
  }
  return deps.repo.update(req)
}
