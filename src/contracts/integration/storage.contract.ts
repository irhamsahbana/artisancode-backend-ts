export interface UploadFileReq {
  key: string
  body: Buffer | ReadableStream
  contentType: string
}

export interface UploadFileRes {
  url: string
  key: string
}

export interface PresignUploadReq {
  key: string
  contentType: string
}

export interface PresignUploadRes {
  url: string
  key: string
  method: string
  headers: Record<string, string>
}

export interface IStorageService {
  upload(req: UploadFileReq): Promise<UploadFileRes>
  presignUpload(req: PresignUploadReq): Promise<PresignUploadRes>
  getPresignedUrl(key: string, expiresIn?: number): Promise<string>
  delete(key: string): Promise<void>
}
