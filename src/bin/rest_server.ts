import http from 'http'

import express, { Express } from 'express'

import { AppError } from '@/common/app_error'
import cors from '@/common/middlewares/cors'
import errorHandler from '@/common/middlewares/error_handler'
import requestLogger from '@/common/middlewares/request_logger'
import { env } from '@/config/env'
import logger from '@/config/logger'
import { startJobs } from '@/jobs'
import restRouter from '@/routes/rest'

class RESTServer {
  server: http.Server
  constructor() {
    const app: Express = express()

    app.use(cors)
    app.use(express.json())
    app.use(requestLogger)

    app.use('/api', restRouter)

    // 404 Handler
    app.use((req, res, next) => {
      next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`))
    })

    app.use(errorHandler)

    this.server = http.createServer(app)
  }

  public listen() {
    this.server.listen(env.REST.PORT, () => {
      logger.info(`Server running on port ${env.REST.PORT}`)
      startJobs()
    })
  }
}

export default RESTServer
