import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'

import { IStorageUsecase } from '../storage.usecase'

export function uploadFileHandler(usecase: IStorageUsecase) {
  return async (c: Context<AppEnv>) => {
    const body = c.get('body')
    const user = c.get('user')

    // NOTE: In production, the file binary would come from multipart form data.
    // For now, this handler expects the file to be passed via request context
    // or a middleware that parses multipart data.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const file = (c as any).get('file') as Buffer | ReadableStream | undefined
    if (!file) {
      return c.json({ success: false, message: 'File is required' }, 400)
    }

    const result = await usecase.uploadFile({
      companyId: user?.company_id || '',
      createdBy: user?.id || '',
      folder: body.folder,
      file,
      filename: body.filename,
      contentType: body.contentType,
      isPublic: body.isPublic,
    })

    return c.json(responseSuccess(result, 'File uploaded successfully'), 201)
  }
}
