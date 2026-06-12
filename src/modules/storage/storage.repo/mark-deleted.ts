import { and, eq } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { storageFiles } from '@/db/schema'

export async function markStorageFileDeleted(id: string, companyId: string): Promise<void> {
  const db = getExecutor()
  const now = new Date()
  await db
    .update(storageFiles)
    .set({ status: 'deleted', deletedAt: now })
    .where(and(eq(storageFiles.id, id), eq(storageFiles.companyId, companyId)))
}
