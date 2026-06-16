import winston from 'winston'

import { env } from '@/config/env'

import { withSourceLocation } from './with-source-location'
import { withTraceContext } from './with-trace-context'

const { combine, timestamp } = winston.format

const logger = winston.createLogger({
  level: env.APP_LOG_LEVEL || 'info',
  format: combine(timestamp(), withTraceContext(), withSourceLocation(), winston.format.json()),
  transports: [
    new winston.transports.Console(),
    // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
})

export default logger
