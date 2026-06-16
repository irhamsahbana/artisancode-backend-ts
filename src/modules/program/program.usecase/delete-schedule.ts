import { AppError, ErrorCode } from '@/common/packages/types'

import { ProgramUsecaseDeps } from '../program.usecase'

export async function deleteSchedule(
  deps: ProgramUsecaseDeps,
  programId: string,
  scheduleId: string,
  companyId: string,
): Promise<void> {
  const program = await deps.repo.findById(programId, companyId)
  if (!program) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Program not found')
  }

  const schedule = program.schedules?.find((s) => s.id === scheduleId)
  if (!schedule) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Schedule not found')
  }

  return deps.repo.deleteSchedule(programId, scheduleId, companyId)
}
