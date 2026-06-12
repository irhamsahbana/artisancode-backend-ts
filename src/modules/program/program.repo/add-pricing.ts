import { db } from '@/common/db'
import {
  productPrices as productPricesTable,
  productPricings as productPricingsTable,
} from '@/db/schema'
import * as Entity from '@/entities/program.entity'

export async function addPricing(req: Entity.AddPricingReq): Promise<Entity.ProgramPricing> {
  return await db.transaction(async (tx) => {
    const [pricing] = await tx
      .insert(productPricingsTable)
      .values({
        productId: req.program_id,
        name: req.name,
        description: req.description || '',
      })
      .returning()

    let prices: Entity.ProgramPrice[] = []
    if (req.prices && req.prices.length > 0) {
      const priceRows = await tx
        .insert(productPricesTable)
        .values(
          req.prices.map((p) => ({
            productPricingId: pricing.id,
            currency: p.currency,
            price: String(p.price),
            startedAt: p.started_at || new Date(),
            endedAt: p.ended_at,
          })),
        )
        .returning()

      prices = priceRows.map((p) => ({
        id: p.id,
        pricing_id: p.productPricingId,
        currency: p.currency,
        price: Number(p.price),
        started_at: p.startedAt,
        ended_at: p.endedAt,
        created_at: p.createdAt,
      }))
    }

    return {
      id: pricing.id,
      program_id: pricing.productId,
      name: pricing.name,
      description: pricing.description,
      is_active: pricing.isActive,
      created_at: pricing.createdAt,
      updated_at: pricing.updatedAt,
      prices,
    }
  })
}
