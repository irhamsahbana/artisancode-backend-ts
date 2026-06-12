export interface StorageFile {
  id: string
  companyId: string
  createdBy: string
  folder: string
  objectKey: string
  originalFilename: string
  contentType: string | null
  isPublic: boolean
  status: 'pending' | 'attached' | 'deleted' | 'failed'
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface CreateStorageFileReq {
  companyId: string
  createdBy: string
  folder: string
  objectKey: string
  originalFilename: string
  contentType?: string
  isPublic?: boolean
}

export interface IStorageRepo {
  create(req: CreateStorageFileReq): Promise<StorageFile>
  findById(id: string, companyId: string): Promise<StorageFile | null>
  findByObjectKey(objectKey: string, companyId: string): Promise<StorageFile | null>
  markAttached(id: string, companyId: string): Promise<void>
  markDeleted(id: string, companyId: string): Promise<void>
  getExpiredPending(before: Date, limit: number): Promise<StorageFile[]>
}
