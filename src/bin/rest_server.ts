import { Hono } from 'hono'

import { corsMiddleware } from '@/common/middlewares/cors'
import { errorHandler } from '@/common/middlewares/error_handler'
import { httpSpan } from '@/common/middlewares/http_span'
import { rawBody } from '@/common/middlewares/raw_body'
import { requestLogger } from '@/common/middlewares/request_logger'
import { traceContext } from '@/common/middlewares/trace_context'
import { AppError, ErrorCode } from '@/common/packages/types'
import { AppEnv } from '@/common/packages/types'
import { env } from '@/config/env'
import logger from '@/config/logger'
import { startJobs } from '@/jobs'
import restRouter from '@/routes/rest'

class RESTServer {
  server: ReturnType<typeof Bun.serve>
  constructor() {
    const app = new Hono<AppEnv>()

    // CORS middleware
    app.use('*', corsMiddleware)

    // Body parser with rawBody capture for webhooks
    app.use('*', rawBody)

    // Extract trace context from incoming requests
    app.use('*', traceContext)

    // OpenTelemetry span per request
    app.use('*', httpSpan())

    // Request logger
    app.use('*', requestLogger)

    // Mount routes
    app.route('/api', restRouter)

    // Not found handler
    app.notFound((c) => {
      throw new AppError(ErrorCode.NOT_FOUND, `Route not found: ${c.req.method} ${c.req.url}`)
    })

    // Error handler
    app.onError(errorHandler)

    this.server = Bun.serve({
      fetch: app.fetch,
      port: env.REST.PORT,
    })
  }

  public listen() {
    logger.info(`Server running on port ${env.REST.PORT} using ${env.APP_LOGGER} logger`)
    startJobs()
  }
}

export default RESTServer
