import type { IStorageService } from '@/contracts/integration'
import type { IStorageRepo } from '@/contracts/storage.contract'

export interface CleanupExpiredReq {
  before?: Date
  limit?: number
}

export async function cleanupExpiredFiles(
  storage: IStorageService,
  repo: IStorageRepo,
  req: CleanupExpiredReq,
) {
  const before = req.before ?? new Date()
  const limit = req.limit ?? 100

  const files = await repo.getExpiredPending(before, limit)
  let deleted = 0

  for (const file of files) {
    try {
      await storage.delete(file.objectKey)
    } catch {
      // continue on S3 error
      continue
    }

    try {
      await repo.markDeleted(file.id, file.companyId)
      deleted++
    } catch {
      // continue on repo error
    }
  }

  return { scanned: files.length, deleted }
}
