import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { activityLogs } from '@/db/schema'
import * as Entity from '@/entities/activity_log.entity'

import { ActivityLogRepoDeps } from '../activity_log.repo'

export async function findActivityLogById(
  deps: ActivityLogRepoDeps,
  id: string,
  companyId: string,
): Promise<Entity.ActivityLog | null> {
  const [row] = await getExecutor()
    .select()
    .from(activityLogs)
    .where(
      and(
        eq(activityLogs.id, id),
        eq(activityLogs.companyId, companyId),
        isNull(activityLogs.deletedAt),
      ),
    )
    .limit(1)
  return row ? deps.toEntity(row) : null
}
