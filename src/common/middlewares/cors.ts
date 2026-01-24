import cors from 'cors'

import { env } from '@/config/env'

const corsOrigins = env.CORS.ORIGINS
const allowCredentials = env.CORS.ALLOW_CREDENTIALS

const corsOpts: cors.CorsOptions = {
  // - If CORS_ORIGINS is provided, only those exact Origin values are allowed.
  // - If empty in production, block browser requests (Origin header present) by default.
  // - If empty in development, allow any origin (the server reflects the request origin).
  origin:
    corsOrigins.length > 0
      ? (origin, callback) => {
          if (!origin) return callback(null, true)
          if (corsOrigins.includes(origin)) return callback(null, true)
          return callback(null, false)
        }
      : env.IS_PRODUCTION
        ? (origin, callback) => {
            if (!origin) return callback(null, true)
            return callback(null, false)
          }
        : true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  // When enabled, the response will include Access-Control-Allow-Credentials: true.
  credentials: allowCredentials,
  optionsSuccessStatus: 204,
}

const corsMiddleware = cors(corsOpts)

export default corsMiddleware
