import { IUserRepo } from '@/contracts/user.contract'
import { users } from '@/db/schema'
import * as Entity from '@/entities/user.entity'

import { checkExistingUser } from './user.repo/check-existing-user'
import { createUser } from './user.repo/create'
import { findUserById } from './user.repo/find-by-id'
import { findUserByUsername } from './user.repo/find-by-username'
import { findUserByUsernameForLogin } from './user.repo/find-by-username-for-login'
import { findUserList } from './user.repo/find-list'
import { register } from './user.repo/register'

export interface UserRepoDeps {
  toEntity: (data: typeof users.$inferSelect) => Entity.User
}

function toEntity(data: typeof users.$inferSelect): Entity.User {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = data
  return rest as unknown as Entity.User
}

export function createUserRepo(): IUserRepo {
  const deps: UserRepoDeps = { toEntity }

  return {
    create: (req) => createUser(deps, req),
    register: (req) => register(req),
    checkExistingUser: (username, email) => checkExistingUser(username, email),
    findList: (req) => findUserList(deps, req),
    findById: (id, companyId) => findUserById(deps, id, companyId),
    findByUsername: (username) => findUserByUsername(deps, username),
    findByUsernameForLogin: (username) => findUserByUsernameForLogin(username),
  }
}

export default createUserRepo
