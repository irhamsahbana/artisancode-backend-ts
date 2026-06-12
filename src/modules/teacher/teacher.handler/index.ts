import { ITeacherUsecase } from '@/contracts/teacher.contract'

import { createTeacherHandler } from './create'
import { deleteTeacherHandler } from './delete'
import { findTeacherByIdHandler } from './find-by-id'
import { findTeacherListHandler } from './find-list'
import { updateTeacherHandler } from './update'

export function createTeacherHandlerDeps(usecase: ITeacherUsecase) {
  return {
    create: createTeacherHandler(usecase),
    update: updateTeacherHandler(usecase),
    delete: deleteTeacherHandler(usecase),
    findById: findTeacherByIdHandler(usecase),
    findList: findTeacherListHandler(usecase),
  }
}
