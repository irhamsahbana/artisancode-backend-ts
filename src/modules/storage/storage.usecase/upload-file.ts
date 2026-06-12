import type { IStorageService } from '@/contracts/integration'
import type { IStorageRepo } from '@/contracts/storage.contract'

export interface UploadFileReq {
  companyId: string
  createdBy: string
  folder: string
  file: Buffer | ReadableStream
  filename: string
  contentType: string
  isPublic?: boolean
}

export async function uploadFile(
  storage: IStorageService,
  repo: IStorageRepo,
  req: UploadFileReq,
) {
  const key = buildObjectKey(req.companyId, req.folder, req.filename, req.isPublic)

  const file = await repo.create({
    companyId: req.companyId,
    createdBy: req.createdBy,
    folder: req.folder,
    objectKey: key,
    originalFilename: req.filename,
    contentType: req.contentType,
    isPublic: req.isPublic,
  })

  const result = await storage.upload({
    key,
    body: req.file,
    contentType: req.contentType,
  })

  await repo.markAttached(file.id, req.companyId)

  return { fileId: file.id, url: result.url, key: result.key }
}

export function buildObjectKey(
  companyId: string,
  folder: string,
  filename: string,
  isPublic?: boolean,
): string {
  const visibility = isPublic ? 'public' : 'private'
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const timestamp = Date.now()
  const prefix = folder ? `${folder}/` : ''

  return `${visibility}/${companyId}/${prefix}${timestamp}-${safeName}`
}
