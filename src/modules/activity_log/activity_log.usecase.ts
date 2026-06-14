import { IActivityLogRepo, IActivityLogUsecase } from '@/contracts/activity_log.contract'
import { withSpan } from '@/telemetry'

import { createActivityLog } from './activity_log.usecase/create'
import { findActivityLogById } from './activity_log.usecase/find-by-id'
import { findActivityLogList } from './activity_log.usecase/find-list'

export interface ActivityLogUsecaseDeps {
  repo: IActivityLogRepo
}

export function createActivityLogUsecase(repo: IActivityLogRepo): IActivityLogUsecase {
  const deps: ActivityLogUsecaseDeps = { repo }

  return {
    create: (req) =>
      withSpan('activity_log.usecase', 'ActivityLogUsecase.create', () => createActivityLog(deps, req)),
    findById: (id, companyId) => findActivityLogById(deps, id, companyId),
    findList: (req) => findActivityLogList(deps, req),
  }
}

export default createActivityLogUsecase
