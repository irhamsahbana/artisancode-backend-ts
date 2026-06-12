import { StudentUsecaseDeps } from '@/contracts/student.contract'
import * as Entity from '@/entities/student.entity'

export async function findStudentById(
  deps: StudentUsecaseDeps,
  id: string,
  companyId: string,
): Promise<Entity.Student | null> {
  return deps.repo.findById(id, companyId)
}
