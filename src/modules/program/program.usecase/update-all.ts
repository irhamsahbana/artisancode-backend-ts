import { AppError, ErrorCode } from '@/common/packages/types'
import * as Entity from '@/entities/program.entity'

import { ProgramUsecaseDeps } from '../program.usecase'

export async function updateAllProgram(
  deps: ProgramUsecaseDeps,
  req: Entity.UpdateProgramAllReq,
): Promise<Entity.Program> {
  const program = await deps.repo.findById(req.id, req.company_id)
  if (!program) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Program not found')
  }

  if (req.branch_id !== undefined && req.branch_id !== null) {
    const branch = await deps.branchRepo.findById(req.branch_id, req.company_id)
    if (!branch) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Branch not found')
    }
  }

  if (req.name && req.name !== program.name) {
    const existingProgram = await deps.repo.findByName(
      req.name,
      req.company_id,
      req.branch_id !== undefined ? req.branch_id : program.branch_id,
    )
    if (existingProgram && existingProgram.id !== req.id) {
      throw new AppError(ErrorCode.CONFLICT, 'Program with this name already exists')
    }
  }

  type PricingList = NonNullable<Entity.UpdateProgramAllReq['pricings']>
  type PriceList = PricingList[number]['prices']

  let nextReq = req
  if (req.pricings) {
    const normalizedPricings: PricingList = req.pricings.map((pricing) => {
      if (!pricing.id) {
        return pricing
      }

      const existingPricing = program.pricings?.find(
        (p: Entity.ProgramPricing) => p.id === pricing.id,
      )
      if (!existingPricing) {
        throw new AppError(ErrorCode.NOT_FOUND, 'Pricing package not found')
      }

      const mergedPrices: PriceList = existingPricing.prices.map(
        (price: Entity.ProgramPrice) => ({
          id: price.id,
          currency: price.currency,
          price: price.price,
          started_at: price.started_at,
          ended_at: price.ended_at,
        }),
      )

      for (const reqPrice of pricing.prices) {
        if (reqPrice.id) {
          const existingPrice = existingPricing.prices.find(
            (p: Entity.ProgramPrice) => p.id === reqPrice.id,
          )
          if (!existingPrice) {
            throw new AppError(ErrorCode.NOT_FOUND, 'Price not found')
          }

          const priceChanged =
            reqPrice.price !== existingPrice.price || reqPrice.currency !== existingPrice.currency

          if (priceChanged) {
            const newStart = reqPrice.started_at ? new Date(reqPrice.started_at) : new Date()
            const newEnd = reqPrice.ended_at === undefined ? null : reqPrice.ended_at

            if (newEnd && newStart > newEnd) {
              throw new AppError(ErrorCode.VALIDATION_ERROR, 'Start date cannot be after end date')
            }

            const existingIndex = mergedPrices.findIndex(
              (p: PriceList[number]) => p.id === reqPrice.id,
            )
            if (existingIndex >= 0) {
              const existingEndedAt = mergedPrices[existingIndex].ended_at
              if (!existingEndedAt || new Date(existingEndedAt) > newStart) {
                mergedPrices[existingIndex] = {
                  ...mergedPrices[existingIndex],
                  ended_at: newStart,
                }
              }
            }

            const otherPrices = mergedPrices.filter(
              (p: PriceList[number]) => p.currency === reqPrice.currency,
            )
            for (const other of otherPrices) {
              const otherStart = other.started_at ? new Date(other.started_at) : new Date(0)
              deps.checkOverlap(
                { start: newStart, end: newEnd },
                {
                  start: otherStart,
                  end: other.ended_at ? new Date(other.ended_at) : null,
                  id: other.id || 'existing',
                },
                reqPrice.currency,
              )
            }

            mergedPrices.push({
              currency: reqPrice.currency,
              price: reqPrice.price,
              started_at: newStart,
              ended_at: newEnd,
            })
            continue
          }

          const effectiveStartedAt = (reqPrice.started_at || existingPrice.started_at) as Date
          const effectiveEndedAt =
            reqPrice.ended_at === undefined ? existingPrice.ended_at : reqPrice.ended_at

          if (effectiveEndedAt && new Date(effectiveStartedAt) > new Date(effectiveEndedAt)) {
            throw new AppError(ErrorCode.VALIDATION_ERROR, 'Start date cannot be after end date')
          }

          const otherPrices = mergedPrices.filter(
            (p: PriceList[number]) => p.id !== reqPrice.id && p.currency === reqPrice.currency,
          )
          for (const other of otherPrices) {
            const otherStart = other.started_at ? new Date(other.started_at) : new Date(0)
            deps.checkOverlap(
              { start: new Date(effectiveStartedAt), end: effectiveEndedAt || null },
              {
                start: otherStart,
                end: other.ended_at ? new Date(other.ended_at) : null,
                id: other.id || 'existing',
              },
              reqPrice.currency,
            )
          }

          const targetIndex = mergedPrices.findIndex(
            (p: PriceList[number]) => p.id === reqPrice.id,
          )
          if (targetIndex >= 0) {
            mergedPrices[targetIndex] = {
              id: reqPrice.id,
              currency: reqPrice.currency,
              price: reqPrice.price,
              started_at: effectiveStartedAt,
              ended_at: effectiveEndedAt,
            }
          }
          continue
        }

        const newStart = reqPrice.started_at ? new Date(reqPrice.started_at) : new Date()
        const newEnd = reqPrice.ended_at === undefined ? null : reqPrice.ended_at

        if (newEnd && newStart > newEnd) {
          throw new AppError(ErrorCode.VALIDATION_ERROR, 'Start date cannot be after end date')
        }

        const openEndedPrice = mergedPrices.find((p: PriceList[number]) => {
          const currentStart = p.started_at ? new Date(p.started_at) : new Date(0)
          return (
            p.currency === reqPrice.currency && p.ended_at === null && currentStart < newStart
          )
        })

        if (openEndedPrice) {
          openEndedPrice.ended_at = newStart
        }

        const otherPrices = mergedPrices.filter(
          (p: PriceList[number]) => p.currency === reqPrice.currency,
        )
        for (const other of otherPrices) {
          const otherStart = other.started_at ? new Date(other.started_at) : new Date(0)
          deps.checkOverlap(
            { start: newStart, end: newEnd },
            {
              start: otherStart,
              end: other.ended_at ? new Date(other.ended_at) : null,
              id: other.id || 'existing',
            },
            reqPrice.currency,
          )
        }

        mergedPrices.push({
          currency: reqPrice.currency,
          price: reqPrice.price,
          started_at: newStart,
          ended_at: newEnd,
        })
      }

      return {
        ...pricing,
        prices: mergedPrices,
      }
    })

    nextReq = {
      ...req,
      pricings: normalizedPricings,
    }
  }

  return deps.repo.updateAll(nextReq)
}
