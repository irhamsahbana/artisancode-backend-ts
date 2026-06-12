import { AppError } from '@/common/app_error'
import type { IStorageService } from '@/contracts/integration'
import type { IStorageRepo } from '@/contracts/storage.contract'

export async function getFileUrl(
  storage: IStorageService,
  repo: IStorageRepo,
  id: string,
  companyId: string,
  expiresIn?: number,
) {
  const file = await repo.findById(id, companyId)
  if (!file) {
    throw new AppError(404, 'File not found')
  }

  const url = await storage.getPresignedUrl(file.objectKey, expiresIn)
  return { url, key: file.objectKey }
}
