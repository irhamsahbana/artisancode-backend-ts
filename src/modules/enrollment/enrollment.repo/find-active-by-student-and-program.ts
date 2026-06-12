import { eq, and, isNull } from 'drizzle-orm'

import { enrollments } from '@/db/schema'
import * as Entity from '@/entities/enrollment.entity'

import { findEnrollmentsWithRelations } from '../enrollment.mapper'
import { EnrollmentRepoDeps } from '../enrollment.repo'

export async function findActiveEnrollmentByStudentAndProgram(
  deps: EnrollmentRepoDeps,
  studentId: string,
  programId: string,
  companyId: string,
): Promise<Entity.Enrollment | null> {
  const conditions = [
    eq(enrollments.studentId, studentId),
    eq(enrollments.productId, programId),
    eq(enrollments.companyId, companyId),
    eq(enrollments.status, 'active'),
    isNull(enrollments.deletedAt),
  ]

  const data = await findEnrollmentsWithRelations(and(...conditions), { limit: 1 })
  if (data.length === 0) return null
  return deps.toEnrollmentEntity(data[0])
}
