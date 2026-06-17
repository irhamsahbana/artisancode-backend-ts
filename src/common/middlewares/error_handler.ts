import { ErrorHandler } from 'hono'
import { ContentfulStatusCode } from 'hono/utils/http-status'

import { AppError } from '@/common/packages/types'
import { AppEnv } from '@/common/packages/types'
import { responseError } from '@/common/rest_response'
import { env } from '@/config/env'
import logger from '@/config/logger'

export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
  // Handle AppError (Business Logic Errors)
  if (err instanceof AppError) {
    const errorResponse = err.getHttpResponse()
    logger.error("AppError occurred:", err.getErrorResponse())
    return c.json(errorResponse, err.toHttpStatus() as ContentfulStatusCode)
  }

  // For non-production environments, send detailed error for unexpected errors
  if (env.APP_ENV !== 'production') {
    const errorResponse = responseError(err.message, err.stack)
    logger.error("Unexpected error occurred:", err)
    return c.json(errorResponse, 500)
  }

  // For production, send a generic error message
  logger.error(err)
  return c.json(responseError('Internal Server Error', 'An unexpected error occurred.'), 500)
}
