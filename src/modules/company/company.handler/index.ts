import { ICompanyUsecase } from '@/contracts/company.contract'

import { createCompanyHandler } from './create'
import { deleteCompanyHandler } from './delete'
import { findCompanyByIdHandler } from './find-by-id'
import { findCompanyListHandler } from './find-list'
import { updateCompanyHandler } from './update'

export function createCompanyHandlerDeps(usecase: ICompanyUsecase) {
  return {
    create: createCompanyHandler(usecase),
    findList: findCompanyListHandler(usecase),
    findById: findCompanyByIdHandler(usecase),
    update: updateCompanyHandler(usecase),
    delete: deleteCompanyHandler(usecase),
  }
}
