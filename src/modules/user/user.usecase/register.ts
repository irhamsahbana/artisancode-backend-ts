import { hashPassword } from '@/common/encryption'
import { AppError, ErrorCode } from '@/common/packages/types'
import * as Entity from '@/entities/user.entity'

import { UserUsecaseDeps } from '../user.usecase'

export async function registerUser(
  deps: UserUsecaseDeps,
  req: Entity.RegisterReq,
): Promise<Entity.RegisterRes> {
  const isExist = await deps.repo.checkExistingUser(req.username, req.email)
  if (isExist) {
    throw new AppError(ErrorCode.CONFLICT, 'Username or email already exists')
  }

  const password = await hashPassword(req.password)
  return await deps.repo.register({ ...req, password })
}
