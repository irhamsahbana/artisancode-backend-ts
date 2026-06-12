import { eq, and, isNull, sql } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { roles } from '@/db/schema'

export async function deleteRole(id: string, companyId?: string): Promise<void> {
  if (companyId) {
    const [existing] = await getExecutor()
      .select({ count: sql<number>`count(*)::int` })
      .from(roles)
      .where(and(eq(roles.id, id), eq(roles.companyId, companyId), isNull(roles.deletedAt)))
    if (existing.count === 0) return
  }

  await getExecutor().update(roles).set({ deletedAt: new Date() }).where(eq(roles.id, id))
}
