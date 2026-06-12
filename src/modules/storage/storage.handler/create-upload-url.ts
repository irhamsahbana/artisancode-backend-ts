import { Context } from 'hono'

import { responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'

import { IStorageUsecase } from '../storage.usecase'

export function createUploadUrlHandler(usecase: IStorageUsecase) {
  return async (c: Context<AppEnv>) => {
    const body = c.get('body')
    const user = c.get('user')

    const result = await usecase.createUploadUrl({
      companyId: user?.company_id || '',
      createdBy: user?.id || '',
      folder: body.folder,
      filename: body.filename,
      originalFilename: body.originalFilename,
      contentType: body.contentType,
      isPublic: body.isPublic,
    })

    return c.json(responseSuccess(result, 'Upload URL created successfully'), 201)
  }
}
