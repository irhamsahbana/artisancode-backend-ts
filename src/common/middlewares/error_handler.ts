import { Request, Response, NextFunction } from 'express'

import { responseError } from '@/common/rest_response'
import { env } from '@/config/env'
import logger from '@/config/logger'

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {

  // If the response has already been sent, delegate to the default Express error handler.
  if (res.headersSent) {
    return next(err)
  }

  // For non-production environments, send detailed error
  if (env.APP_ENV !== 'production') {
    const errorResponse = responseError(err.message, err.stack)
    logger.error(errorResponse)
    return res.status(500).json(errorResponse)
  }

  // For production, send a generic error message
  return res
    .status(500)
    .json(responseError('Internal Server Error', 'An unexpected error occurred.'))
}

export default errorHandler
