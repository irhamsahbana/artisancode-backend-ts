import { hashPassword } from '@/common/encryption'
import * as Entity from '@/entities/user.entity'

import { UserUsecaseDeps } from '../user.usecase'

export async function createUser(
  deps: UserUsecaseDeps,
  req: Entity.CreateUserReq,
): Promise<Entity.User> {
  const password = await hashPassword(req.password)
  return deps.repo.create({ ...req, password })
}
