import winston from 'winston'

import { env } from './env'

const { combine, timestamp, printf, colorize, align } = winston.format

const devFormat = combine(
  colorize(),
  timestamp({
    format: 'YYYY-MM-DD hh:mm:ss.SSS A',
  }),
  align(),
  printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`),
)

const prodFormat = combine(timestamp(), winston.format.json())

const logger = winston.createLogger({
  level: env.APP_LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
})

export default logger
