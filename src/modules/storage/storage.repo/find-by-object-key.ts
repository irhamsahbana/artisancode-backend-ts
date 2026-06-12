import { and, eq, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import type { StorageFile } from '@/contracts/storage.contract'
import { storageFiles } from '@/db/schema'


export async function findStorageFileByObjectKey(
  objectKey: string,
  companyId: string,
): Promise<StorageFile | null> {
  const db = getExecutor()
  const [row] = await db
    .select()
    .from(storageFiles)
    .where(
      and(
        eq(storageFiles.objectKey, objectKey),
        eq(storageFiles.companyId, companyId),
        isNull(storageFiles.deletedAt),
      ),
    )
    .limit(1)

  return (row as StorageFile) ?? null
}
