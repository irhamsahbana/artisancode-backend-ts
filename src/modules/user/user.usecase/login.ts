import { comparePassword } from '@/common/encryption'
import { generateToken } from '@/common/jwt'
import { AppError, ErrorCode } from '@/common/packages/types'
import * as Entity from '@/entities/user.entity'

import { UserUsecaseDeps } from '../user.usecase'

export async function loginUser(
  deps: UserUsecaseDeps,
  req: Entity.LoginReq,
): Promise<Entity.LoginRes | null> {
  const user = await deps.repo.findByUsernameForLogin(req.username)
  if (!user) return null

  const isValid = await comparePassword(req.password, user.password)
  if (!isValid) return null

  if (user.status !== 'active') {
    throw new AppError(ErrorCode.FORBIDDEN, 'User account is not active')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...cleanUser } = user
  const token = generateToken({
    id: user.id,
    company_id: user.companyId,
    role_id: user.roleId,
    name: user.name,
    username: user.username,
  })

  return {
    token,
    ...cleanUser,
  }
}
