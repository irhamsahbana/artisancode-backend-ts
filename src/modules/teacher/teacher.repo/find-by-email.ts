import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { teachers } from '@/db/schema'
import * as Entity from '@/entities/teacher.entity'

import { TeacherRepoDeps } from '../teacher.repo'

export async function findTeacherByEmail(
  deps: TeacherRepoDeps,
  email: string,
): Promise<Entity.Teacher | null> {
  const [row] = await getExecutor()
    .select()
    .from(teachers)
    .where(and(eq(teachers.email, email), isNull(teachers.deletedAt)))
    .limit(1)

  return row ? deps.toEntity(row) : null
}
