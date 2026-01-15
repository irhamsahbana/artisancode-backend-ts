import { Request, Response, NextFunction } from 'express'

import { AppError } from '@/common/app_error'
import { responseError } from '@/common/rest_response'
import { env } from '@/config/env'
import logger from '@/config/logger'

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // If the response has already been sent, delegate to the default Express error handler.
  if (res.headersSent) {
    return next(err)
  }

  // Handle AppError (Business Logic Errors)
  if (err instanceof AppError) {
    const errorResponse = responseError(err.message, err.errors)
    return res.status(err.statusCode).json(errorResponse)
  }

  // For non-production environments, send detailed error for unexpected errors
  if (env.APP_ENV !== 'production') {
    const errorResponse = responseError(err.message, err.stack)
    logger.error(errorResponse)
    return res.status(500).json(errorResponse)
  }

  // For production, send a generic error message
  logger.error(err)
  return res
    .status(500)
    .json(responseError('Internal Server Error', 'An unexpected error occurred.'))
}

export default errorHandler
