import { Context } from 'hono'

import { AppEnv } from '@/common/packages/types'
import { responseSuccess } from '@/common/rest_response'

import { IStorageUsecase } from '../storage.usecase'

export function cleanupExpiredHandler(usecase: IStorageUsecase) {
  return async (c: Context<AppEnv>) => {
    const body = (c.get('body') || {}) as { before?: string; limit?: number }

    const result = await usecase.cleanupExpiredFiles({
      before: body.before ? new Date(body.before) : undefined,
      limit: body.limit,
    })

    return c.json(responseSuccess(result, 'Expired files cleaned up'), 200)
  }
}
