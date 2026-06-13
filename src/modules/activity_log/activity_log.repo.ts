import { IActivityLogRepo } from '@/contracts/activity_log.contract'
import { activityLogs } from '@/db/schema'
import * as Entity from '@/entities/activity_log.entity'

import { createActivityLog } from './activity_log.repo/create'
import { findActivityLogById } from './activity_log.repo/find-by-id'
import { findActivityLogList } from './activity_log.repo/find-list'

export interface ActivityLogRepoDeps {
  toEntity: (data: typeof activityLogs.$inferSelect) => Entity.ActivityLog
}

function toEntity(data: typeof activityLogs.$inferSelect): Entity.ActivityLog {
  return {
    id: data.id,
    company_id: data.companyId,
    branch_id: data.branchId,
    user_id: data.userId,
    entity_name: data.entityName,
    entity_id: data.entityId,
    activity: data.activity,
    before: data.before as Record<string, unknown> | null,
    after: data.after as Record<string, unknown> | null,
    created_at: data.createdAt,
    deleted_at: data.deletedAt,
  }
}

export function createActivityLogRepo(): IActivityLogRepo {
  const deps: ActivityLogRepoDeps = { toEntity }

  return {
    create: (req) => createActivityLog(deps, req),
    findById: (id, companyId) => findActivityLogById(deps, id, companyId),
    findList: (req) => findActivityLogList(deps, req),
  }
}

export default createActivityLogRepo
