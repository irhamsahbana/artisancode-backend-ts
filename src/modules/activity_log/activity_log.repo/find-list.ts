import { eq, and, ilike, isNull, sql } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { activityLogs } from '@/db/schema'
import * as Entity from '@/entities/activity_log.entity'

import { ActivityLogRepoDeps } from '../activity_log.repo'

export async function findActivityLogList(
  deps: ActivityLogRepoDeps,
  req: Entity.GetActivityLogReq,
): Promise<Entity.ActivityLogList> {
  const { pagination = {}, q, company_id, branch_id, user_id, entity_name } = req
  const { page = 1, per_page = 10 } = pagination
  const offset = (page - 1) * per_page

  const conditions = [eq(activityLogs.companyId, company_id), isNull(activityLogs.deletedAt)]

  if (branch_id) {
    conditions.push(eq(activityLogs.branchId, branch_id))
  }

  if (user_id) {
    conditions.push(eq(activityLogs.userId, user_id))
  }

  if (entity_name) {
    conditions.push(eq(activityLogs.entityName, entity_name))
  }

  if (q) {
    conditions.push(ilike(activityLogs.activity, `%${q}%`))
  }

  const where = and(...conditions)

  const exec = getExecutor()
  const [items, countResult] = await Promise.all([
    exec
      .select()
      .from(activityLogs)
      .where(where)
      .orderBy(sql`${activityLogs.createdAt} desc`)
      .limit(per_page)
      .offset(offset),
    exec
      .select({ count: sql<number>`count(*)::int` })
      .from(activityLogs)
      .where(where),
  ])

  const total = countResult[0]?.count ?? 0

  return {
    items: items.map((item) => deps.toEntity(item)),
    pagination: {
      total,
      page,
      per_page,
      last_page: Math.ceil(total / per_page),
    },
  }
}
