import { and, eq, isNull, lt } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import type { StorageFile } from '@/contracts/storage.contract'
import { storageFiles } from '@/db/schema'


export async function getExpiredPendingFiles(before: Date, limit: number): Promise<StorageFile[]> {
  const db = getExecutor()
  const rows = await db
    .select()
    .from(storageFiles)
    .where(
      and(
        eq(storageFiles.status, 'pending'),
        lt(storageFiles.createdAt, before),
        isNull(storageFiles.deletedAt),
      ),
    )
    .limit(limit)

  return rows as StorageFile[]
}
