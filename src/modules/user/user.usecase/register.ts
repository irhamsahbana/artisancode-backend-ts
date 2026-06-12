import { AppError } from '@/common/app_error'
import { hashPassword } from '@/common/encryption'
import * as Entity from '@/entities/user.entity'

import { UserUsecaseDeps } from '../user.usecase'

export async function registerUser(
  deps: UserUsecaseDeps,
  req: Entity.RegisterReq,
): Promise<Entity.RegisterRes> {
  const isExist = await deps.repo.checkExistingUser(req.username, req.email)
  if (isExist) {
    throw new AppError(409, 'Username or email already exists')
  }

  const password = await hashPassword(req.password)
  return await deps.repo.register({ ...req, password })
}
