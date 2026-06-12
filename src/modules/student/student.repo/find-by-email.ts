import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { students } from '@/db/schema'
import * as Entity from '@/entities/student.entity'

import { StudentRepoDeps } from '../student.repo'

export async function findStudentByEmail(
  deps: StudentRepoDeps,
  email: string,
): Promise<Entity.Student | null> {
  const [row] = await getExecutor()
    .select()
    .from(students)
    .where(and(eq(students.email, email), isNull(students.deletedAt)))
    .limit(1)
  return row ? deps.toEntity(row) : null
}
