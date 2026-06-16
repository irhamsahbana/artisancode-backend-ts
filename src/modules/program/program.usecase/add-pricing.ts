import { AppError, ErrorCode } from '@/common/packages/types'
import * as Entity from '@/entities/program.entity'

import { ProgramUsecaseDeps } from '../program.usecase'

export async function addPricing(
  deps: ProgramUsecaseDeps,
  req: Entity.AddPricingReq,
): Promise<Entity.ProgramPricing> {
  const program = await deps.repo.findById(req.program_id, req.company_id)
  if (!program) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Program not found')
  }

  const existingPricingName = program.pricings?.find(
    (p) => p.name.toLowerCase() === req.name.toLowerCase(),
  )
  if (existingPricingName) {
    throw new AppError(ErrorCode.CONFLICT, 'Pricing package with this name already exists')
  }

  deps.validatePricingOverlap(
    [],
    req.prices.map((p) => ({
      ...p,
      id: '',
      pricing_id: '',
      started_at: p.started_at || new Date(),
      ended_at: p.ended_at || null,
      created_at: new Date(),
      updated_at: new Date(),
    })),
  )

  return deps.repo.addPricing(req)
}
