import { AppError } from '@/common/app_error'
import * as Entity from '@/entities/program.entity'

import { ProgramUsecaseDeps } from '../program.usecase'

export async function updatePrice(
  deps: ProgramUsecaseDeps,
  req: Entity.UpdatePriceReq,
): Promise<Entity.ProgramPrice> {
  const program = await deps.repo.findById(req.program_id, req.company_id)
  if (!program) {
    throw new AppError(404, 'Program not found')
  }

  const pricing = program.pricings?.find((p) => p.id === req.pricing_id)
  if (!pricing) {
    throw new AppError(404, 'Pricing package not found')
  }

  const price = pricing.prices.find((p) => p.id === req.price_id)
  if (!price) {
    throw new AppError(404, 'Price not found')
  }

  const effectiveStartedAt = req.started_at
    ? new Date(req.started_at)
    : new Date(price.started_at)
  let effectiveEndedAt: Date | null
  if (req.ended_at === null) {
    effectiveEndedAt = null
  } else if (req.ended_at === undefined) {
    effectiveEndedAt = price.ended_at ? new Date(price.ended_at) : null
  } else {
    effectiveEndedAt = new Date(req.ended_at)
  }

  if (effectiveEndedAt && effectiveStartedAt > effectiveEndedAt) {
    throw new AppError(400, 'Start date cannot be after end date')
  }

  const otherPrices = pricing.prices.filter(
    (p) => p.id !== req.price_id && p.currency === price.currency,
  )

  for (const other of otherPrices) {
    deps.checkOverlap(
      { start: effectiveStartedAt, end: effectiveEndedAt },
      {
        start: new Date(other.started_at),
        end: other.ended_at ? new Date(other.ended_at) : null,
        id: other.id,
      },
      price.currency,
    )
  }

  return deps.repo.updatePrice(req)
}
