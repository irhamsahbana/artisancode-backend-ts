import { env } from './env'

// Interchangeable logger — set APP_LOGGER=winston or pino (default: winston)
const logger =
  env.APP_LOGGER === 'pino'
    ? (await import('@/common/packages/logger-pino/logger')).default
    : (await import('@/common/packages/logger/logger')).default

export default logger
