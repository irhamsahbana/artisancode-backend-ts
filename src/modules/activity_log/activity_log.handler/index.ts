import { IActivityLogUsecase } from '@/contracts/activity_log.contract'

import { createActivityLogHandler } from './create'
import { findActivityLogByIdHandler } from './find-by-id'
import { findActivityLogListHandler } from './find-list'

export function createActivityLogHandlerDeps(usecase: IActivityLogUsecase) {
  return {
    create: createActivityLogHandler(usecase),
    findById: findActivityLogByIdHandler(usecase),
    findList: findActivityLogListHandler(usecase),
  }
}
