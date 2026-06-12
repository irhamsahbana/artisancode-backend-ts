import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { productPricings as productPricingsTable, products as productsTable } from '@/db/schema'

export async function deletePricing(
  programId: string,
  pricingId: string,
  companyId: string,
): Promise<void> {
  const [existing] = await getExecutor()
    .select({ id: productPricingsTable.id })
    .from(productPricingsTable)
    .innerJoin(productsTable, eq(productPricingsTable.productId, productsTable.id))
    .where(
      and(
        eq(productPricingsTable.id, pricingId),
        eq(productPricingsTable.productId, programId),
        eq(productsTable.companyId, companyId),
        isNull(productPricingsTable.deletedAt),
      ),
    )
    .limit(1)

  if (existing) {
    await getExecutor()
      .update(productPricingsTable)
      .set({ deletedAt: new Date() })
      .where(eq(productPricingsTable.id, pricingId))
  }
}
