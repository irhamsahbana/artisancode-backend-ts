import { withSpan } from '@/telemetry'

import { IUserRepo, IUserUsecase } from './user.contract'
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
      withSpan('user.usecase', 'UserUsecase.create', () => createUser(deps, req)),
    register: (req) =>
      withSpan('user.usecase', 'UserUsecase.register', () => registerUser(deps, req)),
    login: (req) =>
      withSpan('user.usecase', 'UserUsecase.login', () => loginUser(deps, req)),
    findList: (req) =>
      withSpan('user.usecase', 'UserUsecase.findList', () => findUserList(deps, req)),
    findById: (id, companyId) =>
      withSpan('user.usecase', 'UserUsecase.findById', () => findUserById(deps, id, companyId)),
    findByUsername: (username) =>
      withSpan('user.usecase', 'UserUsecase.findByUsername', () => findUserByUsername(deps, username)),
  }
}

export default createUserUsecase
