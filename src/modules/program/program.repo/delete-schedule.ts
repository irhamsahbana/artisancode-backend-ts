import { eq, and } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { productSchedules as productSchedulesTable, products as productsTable } from '@/db/schema'

export async function deleteSchedule(
  programId: string,
  scheduleId: string,
  companyId: string,
): Promise<void> {
  const [existing] = await getExecutor()
    .select({ id: productSchedulesTable.id })
    .from(productSchedulesTable)
    .innerJoin(productsTable, eq(productSchedulesTable.productId, productsTable.id))
    .where(
      and(
        eq(productSchedulesTable.id, scheduleId),
        eq(productSchedulesTable.productId, programId),
        eq(productsTable.companyId, companyId),
      ),
    )
    .limit(1)

  if (existing) {
    await getExecutor().delete(productSchedulesTable).where(eq(productSchedulesTable.id, scheduleId))
  }
}
