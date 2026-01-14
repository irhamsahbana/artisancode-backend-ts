import jwt from 'jsonwebtoken'

import { env } from '@/config/env'

interface JwtPayload {
  id: string
  company_id: string
  role_id: string
  name: string
  username: string
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT.SECRET, {
    expiresIn: env.JWT.EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

export const verifyToken = (token: string): unknown => {
  return jwt.verify(token, env.JWT.SECRET)
}
