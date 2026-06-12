export interface UploadFileReq {
  key: string
  body: Buffer | ReadableStream
  contentType: string
}

export interface UploadFileRes {
  url: string
  key: string
}

export interface IStorageService {
  upload(req: UploadFileReq): Promise<UploadFileRes>
  delete(key: string): Promise<void>
}
