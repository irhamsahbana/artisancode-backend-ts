import { getExecutor } from '@/common/executor'
import { productPrices as productPricesTable } from '@/db/schema'
import * as Entity from '@/entities/program.entity'

export async function addPrice(req: Entity.AddPriceReq): Promise<Entity.ProgramPrice> {
  const [row] = await getExecutor()
    .insert(productPricesTable)
    .values({
      productPricingId: req.pricing_id,
      currency: req.currency,
      price: String(req.price),
      startedAt: req.started_at || new Date(),
      endedAt: req.ended_at,
    })
    .returning()

  return {
    id: row.id,
    pricing_id: row.productPricingId,
    currency: row.currency,
    price: Number(row.price),
    started_at: row.startedAt,
    ended_at: row.endedAt,
    created_at: row.createdAt,
  }
}
