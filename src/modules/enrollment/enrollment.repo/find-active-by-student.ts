import { eq, and, isNull } from 'drizzle-orm'

import { enrollments } from '@/db/schema'
import * as Entity from '@/entities/enrollment.entity'

import { findEnrollmentsWithRelations } from '../enrollment.mapper'
import { EnrollmentRepoDeps } from '../enrollment.repo'

export async function findActiveEnrollmentsByStudent(
  deps: EnrollmentRepoDeps,
  studentId: string,
  companyId: string,
): Promise<Entity.Enrollment[]> {
  const conditions = [
    eq(enrollments.studentId, studentId),
    eq(enrollments.companyId, companyId),
    eq(enrollments.status, 'active'),
    isNull(enrollments.deletedAt),
  ]

  const data = await findEnrollmentsWithRelations(and(...conditions))

  return data.map((item) => {
    const entity = deps.toEnrollmentEntity(item)
    if (entity.program) {
      entity.program.schedules = []
    }
    return entity
  })
}
