import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { branches } from '@/db/schema'

export async function deleteBranch(id: string, companyId: string): Promise<void> {
  await getExecutor()
    .update(branches)
    .set({ deletedAt: new Date() })
    .where(
      and(eq(branches.id, id), eq(branches.companyId, companyId), isNull(branches.deletedAt)),
    )
}
