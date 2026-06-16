import { AppError, ErrorCode } from '@/common/packages/types'
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
    throw new AppError(ErrorCode.NOT_FOUND, 'File not found')
  }

  const url = await storage.getPresignedUrl(file.objectKey, expiresIn)
  return { url, key: file.objectKey }
}
