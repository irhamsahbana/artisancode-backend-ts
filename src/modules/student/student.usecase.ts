import { IBranchRepo } from '@/modules/branch/branch.contract'
import { withSpan } from '@/telemetry'

import { IStudentRepo, IStudentUsecase } from './student.contract'
import { createStudent } from './student.usecase/create'
import { deleteStudent } from './student.usecase/delete'
import { findStudentById } from './student.usecase/find-by-id'
import { findStudentList } from './student.usecase/find-list'
import { updateStudent } from './student.usecase/update'

export interface StudentUsecaseDeps {
  repo: IStudentRepo
  branchRepo: IBranchRepo
}

export function createStudentUsecase(
  repo: IStudentRepo,
  branchRepo: IBranchRepo,
): IStudentUsecase {
  const deps: StudentUsecaseDeps = { repo, branchRepo }

  return {
    create: (req) =>
      withSpan('student.usecase', 'StudentUsecase.create', () => createStudent(deps, req)),
    update: (req) =>
      withSpan('student.usecase', 'StudentUsecase.update', () => updateStudent(deps, req)),
    delete: (id, companyId) =>
      withSpan('student.usecase', 'StudentUsecase.delete', () => deleteStudent(deps, id, companyId)),
    findById: (id, companyId) =>
      withSpan('student.usecase', 'StudentUsecase.findById', () => findStudentById(deps, id, companyId)),
    findList: (req) =>
      withSpan('student.usecase', 'StudentUsecase.findList', () => findStudentList(deps, req)),
  }
}

export default createStudentUsecase
