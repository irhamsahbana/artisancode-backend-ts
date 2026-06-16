import { AppError, ErrorCode } from '@/common/packages/types'
import { StudentUsecaseDeps } from '@/contracts/student.contract'
import * as Entity from '@/entities/student.entity'

export async function updateStudent(
  deps: StudentUsecaseDeps,
  req: Entity.UpdateStudentReq,
): Promise<Entity.Student> {
  const student = await deps.repo.findById(req.id, req.company_id)
  if (!student) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Student not found')
  }

  if (req.branch_id) {
    const branch = await deps.branchRepo.findById(req.branch_id, req.company_id)
    if (!branch) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Branch not found')
    }
  }

  return deps.repo.update(req)
}
