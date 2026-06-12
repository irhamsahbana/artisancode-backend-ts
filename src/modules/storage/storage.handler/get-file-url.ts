import { Context } from 'hono'

import { responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'

import { IStorageUsecase } from '../storage.usecase'

export function getFileUrlHandler(usecase: IStorageUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id')
    const user = c.get('user')
    const expiresIn = Number(c.req.query('expiresIn')) || undefined

    const result = await usecase.getFileUrl(id, user?.company_id || '', expiresIn)

    return c.json(responseSuccess(result), 200)
  }
}
