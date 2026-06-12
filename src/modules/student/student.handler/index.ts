import { IStudentUsecase } from '@/contracts/student.contract'

import { createStudentHandler } from './create'
import { deleteStudentHandler } from './delete'
import { findStudentByIdHandler } from './find-by-id'
import { findStudentListHandler } from './find-list'
import { updateStudentHandler } from './update'

export function createStudentHandlerDeps(usecase: IStudentUsecase) {
  return {
    create: createStudentHandler(usecase),
    update: updateStudentHandler(usecase),
    delete: deleteStudentHandler(usecase),
    findById: findStudentByIdHandler(usecase),
    findList: findStudentListHandler(usecase),
  }
}
