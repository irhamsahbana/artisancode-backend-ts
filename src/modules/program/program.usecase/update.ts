import { AppError } from '@/common/app_error'
import * as Entity from '@/entities/program.entity'

import { ProgramUsecaseDeps } from '../program.usecase'

export async function updateProgram(
  deps: ProgramUsecaseDeps,
  req: Entity.UpdateProgramReq,
): Promise<Entity.Program> {
  const program = await deps.repo.findById(req.id, req.company_id)
  if (!program) {
    throw new AppError(404, 'Program not found')
  }

  if (req.name && req.name !== program.name) {
    const existingProgram = await deps.repo.findByName(
      req.name,
      req.company_id,
      req.branch_id || program.branch_id,
    )
    if (existingProgram && existingProgram.id !== req.id) {
      throw new AppError(409, 'Program with this name already exists')
    }
  }

  if (req.branch_id) {
    const branch = await deps.branchRepo.findById(req.branch_id, req.company_id)
    if (!branch) {
      throw new AppError(404, 'Branch not found')
    }
  }

  return deps.repo.update(req)
}
