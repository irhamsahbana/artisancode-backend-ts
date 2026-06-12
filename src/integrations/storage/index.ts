import { IStorageService, UploadFileReq, UploadFileRes } from '@/contracts/integration'

export class StorageIntegration implements IStorageService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async upload(req: UploadFileReq): Promise<UploadFileRes> {
    throw new Error('Storage integration not implemented yet')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async delete(key: string): Promise<void> {
    throw new Error('Storage integration not implemented yet')
  }
}
