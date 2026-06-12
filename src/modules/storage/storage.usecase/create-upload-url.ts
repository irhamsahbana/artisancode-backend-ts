import type { IStorageService } from '@/contracts/integration'
import type { IStorageRepo } from '@/contracts/storage.contract'

import { buildObjectKey } from './upload-file'

export interface CreateUploadUrlReq {
  companyId: string
  createdBy: string
  folder: string
  filename: string
  originalFilename: string
  contentType: string
  isPublic?: boolean
}

export async function createUploadUrl(
  storage: IStorageService,
  repo: IStorageRepo,
  req: CreateUploadUrlReq,
) {
  const key = buildObjectKey(req.companyId, req.folder, req.filename, req.isPublic)

  const file = await repo.create({
    companyId: req.companyId,
    createdBy: req.createdBy,
    folder: req.folder,
    objectKey: key,
    originalFilename: req.originalFilename,
    contentType: req.contentType,
    isPublic: req.isPublic,
  })

  const presign = await storage.presignUpload({ key, contentType: req.contentType })

  return {
    fileId: file.id,
    url: presign.url,
    key: presign.key,
    method: presign.method,
    headers: presign.headers,
  }
}
