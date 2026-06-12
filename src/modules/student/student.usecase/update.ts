import { AppError } from '@/common/app_error'
import * as Entity from '@/entities/student.entity'

import { StudentUsecaseDeps } from '../student.usecase'

export async function updateStudent(
  deps: StudentUsecaseDeps,
  req: Entity.UpdateStudentReq,
): Promise<Entity.Student> {
  const student = await deps.repo.findById(req.id, req.company_id)
  if (!student) {
    throw new AppError(404, 'Student not found')
  }

  if (req.branch_id) {
    const branch = await deps.branchRepo.findById(req.branch_id, req.company_id)
    if (!branch) {
      throw new AppError(404, 'Branch not found')
    }
  }

  return deps.repo.update(req)
}
