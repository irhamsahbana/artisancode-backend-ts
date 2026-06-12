import { AppError } from '@/common/app_error'
import * as Entity from '@/entities/program.entity'

import { ProgramUsecaseDeps } from '../program.usecase'

export async function addPrice(
  deps: ProgramUsecaseDeps,
  req: Entity.AddPriceReq,
): Promise<Entity.ProgramPrice> {
  const program = await deps.repo.findById(req.program_id, req.company_id)
  if (!program) {
    throw new AppError(404, 'Program not found')
  }

  const pricing = program.pricings?.find((p) => p.id === req.pricing_id)
  if (!pricing) {
    throw new AppError(404, 'Pricing package not found')
  }

  const newStart = req.started_at ? new Date(req.started_at) : new Date()
  const newEnd = req.ended_at ? new Date(req.ended_at) : null

  const openEndedPrice = pricing.prices.find(
    (p) =>
      p.currency === req.currency && p.ended_at === null && new Date(p.started_at) < newStart,
  )

  if (openEndedPrice) {
    await deps.repo.updatePrice({
      program_id: req.program_id,
      pricing_id: req.pricing_id,
      price_id: openEndedPrice.id,
      company_id: req.company_id,
      ended_at: newStart,
    })
    openEndedPrice.ended_at = newStart
  }

  const otherPrices = pricing.prices.filter((p) => p.currency === req.currency)

  for (const other of otherPrices) {
    deps.checkOverlap(
      { start: newStart, end: newEnd },
      {
        start: new Date(other.started_at),
        end: other.ended_at ? new Date(other.ended_at) : null,
        id: other.id,
      },
      req.currency,
    )
  }

  return deps.repo.addPrice(req)
}
