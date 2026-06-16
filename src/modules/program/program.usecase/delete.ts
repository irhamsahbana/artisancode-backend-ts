import { AppError, ErrorCode } from '@/common/packages/types'

import { ProgramUsecaseDeps } from '../program.usecase'

export async function deleteProgram(
  deps: ProgramUsecaseDeps,
  id: string,
  companyId: string,
): Promise<void> {
  const program = await deps.repo.findById(id, companyId)
  if (!program) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Program not found')
  }

  const activeEnrollments = await deps.enrollmentRepo.countActiveByProgram(id, companyId)
  if (activeEnrollments > 0) {
    throw new AppError(
      ErrorCode.CONFLICT,
      `Cannot delete program. There are ${activeEnrollments} active enrollments.`,
    )
  }

  return deps.repo.delete(id, companyId)
}
