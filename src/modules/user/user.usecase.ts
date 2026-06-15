import { IUserRepo, IUserUsecase } from '@/contracts/user.contract'
import { withSpan } from '@/telemetry'

import { createUser } from './user.usecase/create'
import { findUserById } from './user.usecase/find-by-id'
import { findUserByUsername } from './user.usecase/find-by-username'
import { findUserList } from './user.usecase/find-list'
import { loginUser } from './user.usecase/login'
import { registerUser } from './user.usecase/register'

export interface UserUsecaseDeps {
  repo: IUserRepo
}

export function createUserUsecase(repo: IUserRepo): IUserUsecase {
  const deps: UserUsecaseDeps = { repo }

  return {
    create: (req) =>
      withSpan('UserUsecase.create', () => createUser(deps, req)),
    register: (req) =>
      withSpan('UserUsecase.register', () => registerUser(deps, req)),
    login: (req) =>
      withSpan('UserUsecase.login', () => loginUser(deps, req)),
    findList: (req) => findUserList(deps, req),
    findById: (id, companyId) => findUserById(deps, id, companyId),
    findByUsername: (username) => findUserByUsername(deps, username),
  }
}

export default createUserUsecase
