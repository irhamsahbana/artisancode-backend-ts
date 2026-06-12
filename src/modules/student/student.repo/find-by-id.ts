import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { students } from '@/db/schema'
import * as Entity from '@/entities/student.entity'

import { StudentRepoDeps } from '../student.repo'

export async function findStudentById(
  deps: StudentRepoDeps,
  id: string,
  companyId: string,
): Promise<Entity.Student | null> {
  const [row] = await getExecutor()
    .select()
    .from(students)
    .where(
      and(eq(students.id, id), eq(students.companyId, companyId), isNull(students.deletedAt)),
    )
    .limit(1)
  return row ? deps.toEntity(row) : null
}
