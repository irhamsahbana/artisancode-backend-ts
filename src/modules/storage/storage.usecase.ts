import { IStorageService } from '@/contracts/integration'
import { IStorageRepo } from '@/contracts/storage.contract'
import { withSpan } from '@/telemetry'

import { cleanupExpiredFiles, CleanupExpiredReq } from './storage.usecase/cleanup-expired'
import { createUploadUrl, CreateUploadUrlReq } from './storage.usecase/create-upload-url'
import { deleteFile } from './storage.usecase/delete-file'
import { getFileUrl } from './storage.usecase/get-file-url'
import { uploadFile, UploadFileReq } from './storage.usecase/upload-file'

export interface StorageUsecaseDeps {
  storage: IStorageService
  repo: IStorageRepo
}

export interface IStorageUsecase {
  uploadFile(req: UploadFileReq): Promise<{ fileId: string; url: string; key: string }>
  createUploadUrl(req: CreateUploadUrlReq): Promise<{
    fileId: string
    url: string
    key: string
    method: string
    headers: Record<string, string>
  }>
  deleteFile(id: string, companyId: string): Promise<void>
  getFileUrl(id: string, companyId: string, expiresIn?: number): Promise<{ url: string; key: string }>
  cleanupExpiredFiles(req: CleanupExpiredReq): Promise<{ scanned: number; deleted: number }>
}

export function createStorageUsecase(
  storage: IStorageService,
  repo: IStorageRepo,
): IStorageUsecase {
  const deps: StorageUsecaseDeps = { storage, repo }

  return {
    uploadFile: (req) =>
      withSpan('storage.usecase', 'StorageUsecase.uploadFile', () => uploadFile(deps.storage, deps.repo, req)),
    createUploadUrl: (req) =>
      withSpan('storage.usecase', 'StorageUsecase.createUploadUrl', () => createUploadUrl(deps.storage, deps.repo, req)),
    deleteFile: (id, companyId) =>
      withSpan('storage.usecase', 'StorageUsecase.deleteFile', () => deleteFile(deps.storage, deps.repo, id, companyId)),
    getFileUrl: (id, companyId, expiresIn) =>
      withSpan('storage.usecase', 'StorageUsecase.getFileUrl', () => getFileUrl(deps.storage, deps.repo, id, companyId, expiresIn)),
    cleanupExpiredFiles: (req) =>
      withSpan('storage.usecase', 'StorageUsecase.cleanupExpiredFiles', () => cleanupExpiredFiles(deps.storage, deps.repo, req)),
  }
}

export default createStorageUsecase
