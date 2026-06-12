import * as Entity from '@/entities/enrollment.entity'

import { EnrollmentRepoDeps } from '../enrollment.repo'

export async function findEnrollmentById(
  deps: EnrollmentRepoDeps,
  id: string,
  companyId: string,
): Promise<Entity.Enrollment | null> {
  const data = await deps.findEnrollmentWithRelations(id, companyId)
  if (!data) return null
  return deps.toEnrollmentEntity(data)
}
