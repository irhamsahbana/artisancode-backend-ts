import { AppError, ErrorCode } from '@/common/packages/types'
import { StudentUsecaseDeps } from '@/contracts/student.contract'

export async function deleteStudent(
  deps: StudentUsecaseDeps,
  id: string,
  companyId: string,
): Promise<void> {
  const student = await deps.repo.findById(id, companyId)
  if (!student) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Student not found')
  }
  return deps.repo.delete(id, companyId)
}
