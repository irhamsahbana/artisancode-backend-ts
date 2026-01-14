import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

import { verifyToken } from '@/common/jwt'
import { responseError } from '@/common/rest_response'
import logger from '@/config/logger'

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload
}

export interface JwtPayload {
  id: string
  company_id: string
  role_id: string
  name: string
  username: string
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json(responseError('Authorization header missing'))
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json(responseError('Token missing'))
  }

  try {
    const decoded = verifyToken(token) as JwtPayload
    req.user = decoded
    next()
  } catch (error) {
    logger.error('Error authenticating token:', error)
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json(responseError('Token expired'))
    }
    return res.status(401).json(responseError('Invalid token'))
  }
}
