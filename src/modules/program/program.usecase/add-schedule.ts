import { AppError, ErrorCode } from '@/common/packages/types'
import * as Entity from '@/entities/program.entity'

import { ProgramUsecaseDeps } from '../program.usecase'

export async function addSchedule(
  deps: ProgramUsecaseDeps,
  req: Entity.AddScheduleReq,
): Promise<Entity.ProgramSchedule> {
  const program = await deps.repo.findById(req.program_id, req.company_id)
  if (!program) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Program not found')
  }
  return deps.repo.addSchedule(req)
}
