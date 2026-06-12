import { ITeacherRepo, ITeacherUsecase } from '@/contracts/teacher.contract'
import { withSpan } from '@/telemetry'

import { createTeacher } from './teacher.usecase/create'
import { deleteTeacher } from './teacher.usecase/delete'
import { findTeacherById } from './teacher.usecase/find-by-id'
import { findTeacherList } from './teacher.usecase/find-list'
import { updateTeacher } from './teacher.usecase/update'

// ---------------------------------------------------------------------------
// Shared dependencies for all usecase operations
// ---------------------------------------------------------------------------
export interface TeacherUsecaseDeps {
  repo: ITeacherRepo
}

// ---------------------------------------------------------------------------
// Factory — composes individual operations into the ITeacherUsecase interface
// ---------------------------------------------------------------------------
export function createTeacherUsecase(repo: ITeacherRepo): ITeacherUsecase {
  const deps: TeacherUsecaseDeps = { repo }

  return {
    create: (req) =>
      withSpan('teacher.usecase', 'TeacherUsecase.create', () => createTeacher(deps, req)),
    update: (req) =>
      withSpan('teacher.usecase', 'TeacherUsecase.update', () => updateTeacher(deps, req)),
    delete: (id, companyId) =>
      withSpan('teacher.usecase', 'TeacherUsecase.delete', () => deleteTeacher(deps, id, companyId)),
    findById: (id, companyId) =>
      withSpan('teacher.usecase', 'TeacherUsecase.findById', () => findTeacherById(deps, id, companyId)),
    findList: (req) =>
      withSpan('teacher.usecase', 'TeacherUsecase.findList', () => findTeacherList(deps, req)),
  }
}

export default createTeacherUsecase
