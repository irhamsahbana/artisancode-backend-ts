import { AppError } from '@/common/app_error'

import { TeacherUsecaseDeps } from '../teacher.usecase'

export async function deleteTeacher(
  deps: TeacherUsecaseDeps,
  id: string,
  companyId: string,
): Promise<void> {
  const teacher = await deps.repo.findById(id, companyId)
  if (!teacher) {
    throw new AppError(404, 'Teacher not found')
  }
  return deps.repo.delete(id, companyId)
}
