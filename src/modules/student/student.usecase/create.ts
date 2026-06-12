import { AppError } from '@/common/app_error'
import * as Entity from '@/entities/student.entity'

import { StudentUsecaseDeps } from '../student.usecase'

export async function createStudent(
  deps: StudentUsecaseDeps,
  req: Entity.CreateStudentReq,
): Promise<Entity.Student> {
  const branch = await deps.branchRepo.findById(req.branch_id, req.company_id)
  if (!branch) {
    throw new AppError(404, 'Branch not found')
  }
  return deps.repo.create(req)
}
