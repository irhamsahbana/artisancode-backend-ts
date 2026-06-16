import { withSpan } from '@/common/packages/observability'
import { ITeacherRepo, ITeacherUsecase } from '@/contracts/teacher.contract'

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
      withSpan('TeacherUsecase.create', () => createTeacher(deps, req)),
    update: (req) =>
      withSpan('TeacherUsecase.update', () => updateTeacher(deps, req)),
    delete: (id, companyId) => deleteTeacher(deps, id, companyId),
    findById: (id, companyId) => findTeacherById(deps, id, companyId),
    findList: (req) => findTeacherList(deps, req),
  }
}

export default createTeacherUsecase
