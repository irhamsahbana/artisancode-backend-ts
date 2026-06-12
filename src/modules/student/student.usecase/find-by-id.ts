import * as Entity from '@/entities/student.entity'

import { StudentUsecaseDeps } from '../student.usecase'

export async function findStudentById(
  deps: StudentUsecaseDeps,
  id: string,
  companyId: string,
): Promise<Entity.Student | null> {
  return deps.repo.findById(id, companyId)
}
