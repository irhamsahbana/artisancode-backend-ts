import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'
import { getUserContext } from '@/common/store/user-context'

import { IStorageUsecase } from '../storage.usecase'

export function getFileUrlHandler(usecase: IStorageUsecase) {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = getUserContext()
    const expiresIn = Number(c.req.query('expiresIn')) || undefined

    const result = await usecase.getFileUrl(id, user?.company_id || '', expiresIn)

    return c.json(responseSuccess(result), 200)
  }
}
