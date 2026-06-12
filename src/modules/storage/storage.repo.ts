import { IStorageRepo } from '@/contracts/storage.contract'

import { createStorageFile } from './storage.repo/create'
import { findStorageFileById } from './storage.repo/find-by-id'
import { findStorageFileByObjectKey } from './storage.repo/find-by-object-key'
import { getExpiredPendingFiles } from './storage.repo/get-expired-pending'
import { markStorageFileAttached } from './storage.repo/mark-attached'
import { markStorageFileDeleted } from './storage.repo/mark-deleted'

export function createStorageRepo(): IStorageRepo {
  return {
    create: (req) => createStorageFile(req),
    findById: (id, companyId) => findStorageFileById(id, companyId),
    findByObjectKey: (objectKey, companyId) => findStorageFileByObjectKey(objectKey, companyId),
    markAttached: (id, companyId) => markStorageFileAttached(id, companyId),
    markDeleted: (id, companyId) => markStorageFileDeleted(id, companyId),
    getExpiredPending: (before, limit) => getExpiredPendingFiles(before, limit),
  }
}

export default createStorageRepo
