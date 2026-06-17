import { Context, Next } from 'hono'
import jwt from 'jsonwebtoken'

import { verifyToken } from '@/common/jwt'
import { AppEnv, ErrorCode, JwtPayload } from '@/common/packages/types'
import { responseError } from '@/common/rest_response'
import { runWithUserContext } from '@/common/store/user-context'
import logger from '@/config/logger'

export const authenticate = async (c: Context<AppEnv>, next: Next) => {
  const authHeader = c.req.header('authorization')

  if (!authHeader) {
    return c.json(responseError('Authorization header missing', undefined, ErrorCode.UNAUTHORIZED), 401)
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    return c.json(responseError('Token missing', undefined, ErrorCode.UNAUTHORIZED), 401)
  }

  try {
    const decoded = verifyToken(token) as JwtPayload
    c.set('user', decoded)
    return runWithUserContext(decoded, () => next())
  } catch (error) {
    logger.error('Error authenticating token:', error)
    if (error instanceof jwt.TokenExpiredError) {
      return c.json(responseError('Token expired', undefined, ErrorCode.AUTH_TOKEN_EXPIRED), 401)
    }
    return c.json(responseError('Invalid token', undefined, ErrorCode.AUTH_TOKEN_INVALID), 401)
  }
}
