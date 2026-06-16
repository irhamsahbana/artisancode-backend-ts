import { AppError, ErrorCode } from '@/common/packages/types'
import { StudentUsecaseDeps } from '@/contracts/student.contract'
import * as Entity from '@/entities/student.entity'

export async function createStudent(
  deps: StudentUsecaseDeps,
  req: Entity.CreateStudentReq,
): Promise<Entity.Student> {
  const branch = await deps.branchRepo.findById(req.branch_id, req.company_id)
  if (!branch) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Branch not found')
  }
  return deps.repo.create(req)
}
