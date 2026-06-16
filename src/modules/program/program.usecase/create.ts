import { AppError, ErrorCode } from '@/common/packages/types'
import * as Entity from '@/entities/program.entity'

import { ProgramUsecaseDeps } from '../program.usecase'

export async function createProgram(
  deps: ProgramUsecaseDeps,
  req: Entity.CreateProgramReq,
): Promise<Entity.Program> {
  if (req.branch_id) {
    const branch = await deps.branchRepo.findById(req.branch_id, req.company_id)
    if (!branch) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Branch not found')
    }
  }

  const existingProgram = await deps.repo.findByName(
    req.name,
    req.company_id,
    req.branch_id || null,
  )
  if (existingProgram) {
    throw new AppError(ErrorCode.CONFLICT, 'Program with this name already exists')
  }

  if (req.pricings) {
    for (const pricing of req.pricings) {
      deps.validatePricingOverlap(
        [],
        pricing.prices.map((p) => ({
          ...p,
          id: '',
          pricing_id: '',
          started_at: p.started_at || new Date(),
          ended_at: p.ended_at || null,
          created_at: new Date(),
        })),
      )
    }
  }

  return deps.repo.create(req)
}
