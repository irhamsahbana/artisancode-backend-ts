import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { students } from '@/db/schema'

export async function deleteStudent(id: string, companyId: string): Promise<void> {
  await getExecutor()
    .update(students)
    .set({ deletedAt: new Date() })
    .where(
      and(eq(students.id, id), eq(students.companyId, companyId), isNull(students.deletedAt)),
    )
}
