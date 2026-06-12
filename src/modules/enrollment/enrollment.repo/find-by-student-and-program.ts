import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { enrollments, students } from '@/db/schema'
import * as Entity from '@/entities/enrollment.entity'

import { findEnrollmentsWithRelations } from '../enrollment.mapper'
import { EnrollmentRepoDeps } from '../enrollment.repo'

export async function findEnrollmentByStudentAndProgram(
  deps: EnrollmentRepoDeps,
  studentId: string,
  programId: string,
  companyId: string,
): Promise<Entity.Enrollment | null> {
  const exec = getExecutor()
  const [student] = await exec
    .select()
    .from(students)
    .where(
      and(
        eq(students.id, studentId),
        eq(students.companyId, companyId),
        isNull(students.deletedAt),
      ),
    )
    .limit(1)

  if (!student || (student.status !== 'active' && student.status !== 'on_leave')) {
    return null
  }

  const conditions = [
    eq(enrollments.studentId, studentId),
    eq(enrollments.productId, programId),
    eq(enrollments.companyId, companyId),
    isNull(enrollments.deletedAt),
  ]

  const data = await findEnrollmentsWithRelations(and(...conditions), { limit: 1 })
  if (data.length === 0) return null
  return deps.toEnrollmentEntity(data[0])
}
