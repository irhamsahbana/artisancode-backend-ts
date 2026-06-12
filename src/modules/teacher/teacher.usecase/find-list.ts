import * as Entity from '@/entities/teacher.entity'

import { TeacherUsecaseDeps } from '../teacher.usecase'

export async function findTeacherList(
  deps: TeacherUsecaseDeps,
  req: Entity.GetTeacherReq,
): Promise<Entity.TeacherList> {
  return deps.repo.findList(req)
}
