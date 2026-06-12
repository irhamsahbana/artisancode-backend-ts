import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { AppError } from '@/common/app_error'
import { errorHandler } from '@/common/middlewares/error_handler'
import { requestLogger } from '@/common/middlewares/request_logger'
import { AppEnv } from '@/common/types'
import { env } from '@/config/env'
import logger from '@/config/logger'
import { startJobs } from '@/jobs'
import restRouter from '@/routes/rest'

const corsOrigins = env.CORS.ORIGINS
const allowCredentials = env.CORS.ALLOW_CREDENTIALS

class RESTServer {
  server: ReturnType<typeof Bun.serve>
  constructor() {
    const app = new Hono<AppEnv>()

    // CORS middleware
    app.use(
      '*',
      cors({
        origin: (origin) => {
          // If no origins configured
          if (corsOrigins.length === 0) {
            // In production, block browser requests with Origin header
            if (env.IS_PRODUCTION) {
              return origin ? '' : '*'
            }
            // In development, allow any origin
            return origin || '*'
          }
          // If origins configured, check if origin is in the list
          if (origin && corsOrigins.includes(origin)) {
            return origin
          }
          return ''
        },
        allowMethods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        credentials: allowCredentials,
      }),
    )

    // Body parser with rawBody capture for webhooks
    app.use('*', async (c, next) => {
      const clone = c.req.raw.clone()
      const text = await clone.text()
      c.set('rawBody', text)
      await next()
    })

    // Request logger
    app.use('*', requestLogger)

    // Mount routes
    app.route('/api', restRouter)

    // Not found handler
    app.notFound((c) => {
      throw new AppError(404, `Route not found: ${c.req.method} ${c.req.url}`)
    })

    // Error handler
    app.onError(errorHandler)

    this.server = Bun.serve({
      fetch: app.fetch,
      port: env.REST.PORT,
    })
  }

  public listen() {
    logger.info(`Server running on port ${env.REST.PORT}`)
    startJobs()
  }
}

export default RESTServer
