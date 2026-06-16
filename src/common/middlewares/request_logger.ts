import { Context, Next } from 'hono'

import logger from '@/config/logger'

export const requestLogger = async (c: Context, next: Next) => {
  const startTime = Date.now()
  await next()
  const duration = Date.now() - startTime

  logger.info(`${c.req.method} | ${c.req.url} | ${duration}ms | status code ${c.res.status}`)
}
