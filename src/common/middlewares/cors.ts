import { cors } from 'hono/cors'

import { env } from '@/config/env'

const corsOrigins = env.CORS.ORIGINS
const allowCredentials = env.CORS.ALLOW_CREDENTIALS

export const corsMiddleware = cors({
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
})
