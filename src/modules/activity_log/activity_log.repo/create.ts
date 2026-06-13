import { getExecutor } from '@/common/executor'
import { activityLogs } from '@/db/schema'
import * as Entity from '@/entities/activity_log.entity'

import { ActivityLogRepoDeps } from '../activity_log.repo'

export async function createActivityLog(
  deps: ActivityLogRepoDeps,
  req: Entity.CreateActivityLogReq,
): Promise<Entity.ActivityLog> {
  const [row] = await getExecutor()
    .insert(activityLogs)
    .values({
      companyId: req.company_id,
      branchId: req.branch_id,
      userId: req.user_id,
      entityName: req.entity_name,
      entityId: req.entity_id,
      activity: req.activity,
      before: req.before,
      after: req.after,
    })
    .returning()
  return deps.toEntity(row)
}
