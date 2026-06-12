import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { teachers } from '@/db/schema'

export async function deleteTeacher(id: string, companyId: string): Promise<void> {
  await getExecutor()
    .update(teachers)
    .set({ deletedAt: new Date() })
    .where(
      and(eq(teachers.id, id), eq(teachers.companyId, companyId), isNull(teachers.deletedAt)),
    )
}
