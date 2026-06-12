import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { enrollments } from '@/db/schema'

export async function deleteEnrollment(id: string, companyId: string): Promise<void> {
  const exec = getExecutor()
  await exec
    .update(enrollments)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(enrollments.id, id),
        eq(enrollments.companyId, companyId),
        isNull(enrollments.deletedAt),
      ),
    )
}
