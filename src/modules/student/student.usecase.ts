import { withSpan } from '@/common/packages/observability'
import { IBranchRepo } from '@/contracts/branch.contract'
import { IStudentRepo, IStudentUsecase, StudentUsecaseDeps } from '@/contracts/student.contract'

import { createStudent } from './student.usecase/create'
import { deleteStudent } from './student.usecase/delete'
import { findStudentById } from './student.usecase/find-by-id'
import { findStudentList } from './student.usecase/find-list'
import { updateStudent } from './student.usecase/update'

export function createStudentUsecase(
  repo: IStudentRepo,
  branchRepo: IBranchRepo,
): IStudentUsecase {
  const deps: StudentUsecaseDeps = { repo, branchRepo }

  return {
    create: (req) =>
      withSpan('StudentUsecase.create', () => createStudent(deps, req)),
    update: (req) =>
      withSpan('StudentUsecase.update', () => updateStudent(deps, req)),
    delete: (id, companyId) => deleteStudent(deps, id, companyId),
    findById: (id, companyId) => findStudentById(deps, id, companyId),
    findList: (req) => findStudentList(deps, req),
  }
}

export default createStudentUsecase
