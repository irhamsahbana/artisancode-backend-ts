import { eq, and } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import {
  productPrices as productPricesTable,
  productPricings as productPricingsTable,
  products as productsTable,
} from '@/db/schema'
import * as Entity from '@/entities/program.entity'

export async function updatePrice(req: Entity.UpdatePriceReq): Promise<Entity.ProgramPrice> {
  const [existing] = await getExecutor()
    .select({ id: productPricesTable.id })
    .from(productPricesTable)
    .innerJoin(
      productPricingsTable,
      eq(productPricesTable.productPricingId, productPricingsTable.id),
    )
    .innerJoin(productsTable, eq(productPricingsTable.productId, productsTable.id))
    .where(
      and(
        eq(productPricesTable.id, req.price_id),
        eq(productPricingsTable.id, req.pricing_id),
        eq(productPricingsTable.productId, req.program_id),
        eq(productsTable.companyId, req.company_id),
      ),
    )
    .limit(1)

  if (!existing) throw new Error('Price not found')

  const [row] = await getExecutor()
    .update(productPricesTable)
    .set({
      price: req.price !== undefined ? String(req.price) : undefined,
      startedAt: req.started_at,
      endedAt: req.ended_at,
    })
    .where(eq(productPricesTable.id, req.price_id))
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
