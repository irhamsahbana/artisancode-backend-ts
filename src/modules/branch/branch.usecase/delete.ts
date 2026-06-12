import { AppError } from '@/common/app_error'

import { BranchUsecaseDeps } from '../branch.usecase'

export async function deleteBranch(
  deps: BranchUsecaseDeps,
  id: string,
  companyId: string,
): Promise<void> {
  const branch = await deps.repo.findById(id, companyId)
  if (!branch) {
    throw new AppError(404, 'Branch not found')
  }
  return deps.repo.delete(id, companyId)
}
