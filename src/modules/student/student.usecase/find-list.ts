import * as Entity from '@/entities/student.entity'

import { StudentUsecaseDeps } from '../student.usecase'

export async function findStudentList(
  deps: StudentUsecaseDeps,
  req: Entity.GetStudentReq,
): Promise<Entity.StudentList> {
  return deps.repo.findList(req)
}
