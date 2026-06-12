import { AppError } from '@/common/app_error'

import { ProgramUsecaseDeps } from '../program.usecase'

export async function deleteSchedule(
  deps: ProgramUsecaseDeps,
  programId: string,
  scheduleId: string,
  companyId: string,
): Promise<void> {
  const program = await deps.repo.findById(programId, companyId)
  if (!program) {
    throw new AppError(404, 'Program not found')
  }

  const schedule = program.schedules?.find((s) => s.id === scheduleId)
  if (!schedule) {
    throw new AppError(404, 'Schedule not found')
  }

  return deps.repo.deleteSchedule(programId, scheduleId, companyId)
}
