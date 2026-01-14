import 'dotenv/config'

export const env = {
  REST: {
    PORT: process.env.REST_PORT ? parseInt(process.env.REST_PORT, 10) : 3000,
  },
  APP_ENV: process.env.APP_ENV || 'development',
  APP_NAME: process.env.APP_NAME || 'artisancode-backend-ts',
  APP_VERSION: process.env.APP_VERSION || '1.0.0',
  APP_LOG_LEVEL: process.env.APP_LOG_LEVEL || 'info',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT: {
    SECRET: process.env.JWT_SECRET || 'secret',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  },
}
