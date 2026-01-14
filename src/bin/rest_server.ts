import http from 'http'

import express, { Express } from 'express'

import cors from '@/common/middlewares/cors'
import errorHandler from '@/common/middlewares/error_handler'
import requestLogger from '@/common/middlewares/request_logger'
import { env } from '@/config/env'
import logger from '@/config/logger'
import restRouter from '@/routes/rest'

class RESTServer {
  server: http.Server
  constructor() {
    const app: Express = express()

    app.use(cors)
    app.use(express.json())
    app.use(requestLogger)

    app.use('/api', restRouter)

    app.use(errorHandler)

    this.server = http.createServer(app)
  }

  public listen() {
    this.server.listen(env.REST.PORT, () => {
      logger.info(`Server running on port ${env.REST.PORT}`)
    })
  }
}

export default RESTServer
