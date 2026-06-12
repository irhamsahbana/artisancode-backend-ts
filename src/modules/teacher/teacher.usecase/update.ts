import { AppError } from '@/common/app_error'
import * as Entity from '@/entities/teacher.entity'

import { TeacherUsecaseDeps } from '../teacher.usecase'

export async function updateTeacher(
  deps: TeacherUsecaseDeps,
  req: Entity.UpdateTeacherReq,
): Promise<Entity.Teacher> {
  const teacher = await deps.repo.findById(req.id, req.company_id)
  if (!teacher) {
    throw new AppError(404, 'Teacher not found')
  }

  if (req.email && req.email !== teacher.email) {
    const existing = await deps.repo.findByEmail(req.email)
    if (existing) {
      throw new AppError(409, 'Teacher with this email already exists')
    }
  }

  return deps.repo.update(req)
}
