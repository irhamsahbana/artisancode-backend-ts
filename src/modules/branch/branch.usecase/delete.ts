import { AppError, ErrorCode } from '@/common/packages/types'

import { BranchUsecaseDeps } from '../branch.usecase'

export async function deleteBranch(
  deps: BranchUsecaseDeps,
  id: string,
  companyId: string,
): Promise<void> {
  const branch = await deps.repo.findById(id, companyId)
  if (!branch) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Branch not found')
  }
  return deps.repo.delete(id, companyId)
}
