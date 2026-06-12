import { getExecutor } from '@/common/executor'
import type { CreateStorageFileReq, StorageFile } from '@/contracts/storage.contract'
import { storageFiles } from '@/db/schema'


export async function createStorageFile(req: CreateStorageFileReq): Promise<StorageFile> {
  const db = getExecutor()
  const [row] = await db
    .insert(storageFiles)
    .values({
      companyId: req.companyId,
      createdBy: req.createdBy,
      folder: req.folder,
      objectKey: req.objectKey,
      originalFilename: req.originalFilename,
      contentType: req.contentType ?? null,
      isPublic: req.isPublic ?? false,
    })
    .returning()

  return row as StorageFile
}
