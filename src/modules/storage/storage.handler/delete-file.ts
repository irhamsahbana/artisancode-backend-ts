import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'

import { IStorageUsecase } from '../storage.usecase'

export function deleteFileHandler(usecase: IStorageUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')

    await usecase.deleteFile(id, user?.company_id || '')

    return c.json(responseSuccess(null, 'File deleted successfully'), 200)
  }
}
