import * as Entity from '@/entities/activity_log.entity'

import { ActivityLogUsecaseDeps } from '../activity_log.usecase'

export async function findActivityLogById(
  deps: ActivityLogUsecaseDeps,
  id: string,
  companyId: string,
): Promise<Entity.ActivityLog | null> {
  return deps.repo.findById(id, companyId)
}
