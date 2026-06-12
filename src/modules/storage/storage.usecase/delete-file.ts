import { AppError } from '@/common/app_error'
import type { IStorageService } from '@/contracts/integration'
import type { IStorageRepo } from '@/contracts/storage.contract'

export async function deleteFile(
  storage: IStorageService,
  repo: IStorageRepo,
  id: string,
  companyId: string,
) {
  const file = await repo.findById(id, companyId)
  if (!file) {
    throw new AppError(404, 'File not found')
  }

  if (file.status !== 'pending') {
    throw new AppError(400, 'File can no longer be deleted')
  }

  await storage.delete(file.objectKey)
  await repo.markDeleted(file.id, companyId)
}
