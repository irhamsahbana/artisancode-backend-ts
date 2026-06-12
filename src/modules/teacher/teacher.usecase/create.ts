import { AppError } from '@/common/app_error'
import * as Entity from '@/entities/teacher.entity'

import { TeacherUsecaseDeps } from '../teacher.usecase'

export async function createTeacher(
  deps: TeacherUsecaseDeps,
  req: Entity.CreateTeacherReq,
): Promise<Entity.Teacher> {
  const existing = await deps.repo.findByEmail(req.email)
  if (existing) {
    throw new AppError(409, 'Teacher with this email already exists')
  }
  return deps.repo.create(req)
}
