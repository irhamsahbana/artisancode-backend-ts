import * as Entity from '@/entities/activity_log.entity'

import { ActivityLogUsecaseDeps } from '../activity_log.usecase'

export async function createActivityLog(
  deps: ActivityLogUsecaseDeps,
  req: Entity.CreateActivityLogReq,
): Promise<Entity.ActivityLog> {
  return deps.repo.create(req)
}
