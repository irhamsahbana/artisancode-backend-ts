import { IUserUsecase } from '@/contracts/user.contract'

import { createUserHandler } from './create'
import { findUserByIdHandler } from './find-by-id'
import { findUserListHandler } from './find-list'
import { loginUserHandler } from './login'
import { registerUserHandler } from './register'

export function createUserHandlerDeps(usecase: IUserUsecase) {
  return {
    create: createUserHandler(usecase),
    register: registerUserHandler(usecase),
    login: loginUserHandler(usecase),
    findList: findUserListHandler(usecase),
    findById: findUserByIdHandler(usecase),
  }
}
