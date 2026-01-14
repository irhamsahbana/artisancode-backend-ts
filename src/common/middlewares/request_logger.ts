import { NextFunction, Request, Response } from 'express'

import logger from '../../config/logger'

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = new Date()
  logger.info(`--> ${req.method} ${req.originalUrl}`)
  res.on('finish', () => {
    const endTime = new Date()
    const duration = endTime.getTime() - startTime.getTime()
    logger.info(
      `access log ${req.method} | ${req.originalUrl} | ${duration}ms | status code ${res.statusCode}`,
    )
  })
  next()
}

export default requestLogger
