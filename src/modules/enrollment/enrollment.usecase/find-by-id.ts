import * as Entity from '@/entities/enrollment.entity'

import { EnrollmentUsecaseDeps } from '../enrollment.usecase'

export async function findEnrollmentById(
  deps: EnrollmentUsecaseDeps,
  id: string,
  companyId: string,
): Promise<Entity.Enrollment | null> {
  return deps.repo.findById(id, companyId)
}
