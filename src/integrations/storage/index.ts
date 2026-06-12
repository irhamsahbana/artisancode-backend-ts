
import type {
  IStorageService,
  PresignUploadReq,
  PresignUploadRes,
  UploadFileReq,
  UploadFileRes,
} from '@/contracts/integration'

import { createS3Client, createS3Config, type S3Config } from './client'
import { deleteFile } from './delete'
import { presignUpload, getPresignedGetUrl } from './presign'
import { upload } from './upload'

import type { S3Client } from '@aws-sdk/client-s3'

export class StorageIntegration implements IStorageService {
  private config: S3Config
  private client: S3Client

  constructor() {
    this.config = createS3Config()
    this.client = createS3Client(this.config)
  }

  async upload(req: UploadFileReq): Promise<UploadFileRes> {
    return upload(this.config, this.client, req)
  }

  async presignUpload(req: PresignUploadReq): Promise<PresignUploadRes> {
    return presignUpload(this.config, this.client, req)
  }

  async getPresignedUrl(key: string, expiresIn?: number): Promise<string> {
    return getPresignedGetUrl(this.config, this.client, key, expiresIn)
  }

  async delete(key: string): Promise<void> {
    return deleteFile(this.config, this.client, key)
  }
}
