import * as Entity from '@/entities/activity_log.entity'

import { ActivityLogUsecaseDeps } from '../activity_log.usecase'

export async function findActivityLogList(
  deps: ActivityLogUsecaseDeps,
  req: Entity.GetActivityLogReq,
): Promise<Entity.ActivityLogList> {
  return deps.repo.findList(req)
}
