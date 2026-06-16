import { AppError, ErrorCode } from '@/common/packages/types'

import { TeacherUsecaseDeps } from '../teacher.usecase'

export async function deleteTeacher(
  deps: TeacherUsecaseDeps,
  id: string,
  companyId: string,
): Promise<void> {
  const teacher = await deps.repo.findById(id, companyId)
  if (!teacher) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Teacher not found')
  }
  return deps.repo.delete(id, companyId)
}
