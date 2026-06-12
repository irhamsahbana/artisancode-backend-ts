import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { products as productsTable } from '@/db/schema'

export async function deleteProgram(id: string, companyId: string): Promise<void> {
  await getExecutor()
    .update(productsTable)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(productsTable.id, id),
        eq(productsTable.companyId, companyId),
        isNull(productsTable.deletedAt),
      ),
    )
}
