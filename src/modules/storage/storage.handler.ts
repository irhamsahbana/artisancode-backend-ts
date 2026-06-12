import { cleanupExpiredHandler } from './storage.handler/cleanup-expired'
import { createUploadUrlHandler } from './storage.handler/create-upload-url'
import { deleteFileHandler } from './storage.handler/delete-file'
import { getFileUrlHandler } from './storage.handler/get-file-url'
import { uploadFileHandler } from './storage.handler/upload-file'
import { IStorageUsecase } from './storage.usecase'

export function createStorageHandlerDeps(usecase: IStorageUsecase) {
  return {
    uploadFile: uploadFileHandler(usecase),
    createUploadUrl: createUploadUrlHandler(usecase),
    deleteFile: deleteFileHandler(usecase),
    getFileUrl: getFileUrlHandler(usecase),
    cleanupExpired: cleanupExpiredHandler(usecase),
  }
}
