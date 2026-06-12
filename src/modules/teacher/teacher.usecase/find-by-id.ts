import * as Entity from '@/entities/teacher.entity'

import { TeacherUsecaseDeps } from '../teacher.usecase'

export async function findTeacherById(
  deps: TeacherUsecaseDeps,
  id: string,
  companyId: string,
): Promise<Entity.Teacher | null> {
  return deps.repo.findById(id, companyId)
}
