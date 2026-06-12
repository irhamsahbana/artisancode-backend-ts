import { and, eq } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { storageFiles } from '@/db/schema'

export async function markStorageFileAttached(id: string, companyId: string): Promise<void> {
  const db = getExecutor()
  await db
    .update(storageFiles)
    .set({ status: 'attached' })
    .where(and(eq(storageFiles.id, id), eq(storageFiles.companyId, companyId)))
}
