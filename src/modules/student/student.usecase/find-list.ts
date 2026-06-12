import { StudentUsecaseDeps } from '@/contracts/student.contract'
import * as Entity from '@/entities/student.entity'

export async function findStudentList(
  deps: StudentUsecaseDeps,
  req: Entity.GetStudentReq,
): Promise<Entity.StudentList> {
  return deps.repo.findList(req)
}
