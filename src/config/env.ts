import 'dotenv/config'

const parseBoolean = (value: string | undefined, def: boolean): boolean => {
  if (value === undefined) return def
  return value.toLowerCase() === 'true'
}

const parseNumber = (value: string | undefined, def: number): number => {
  const n = Number(value)
  return Number.isFinite(n) ? n : def
}

export const env = {
  REST: {
    PORT: process.env.REST_PORT ? parseInt(process.env.REST_PORT, 10) : 3000,
  },
  APP_ENV: process.env.APP_ENV || 'development',
  APP_NAME: process.env.APP_NAME || 'artisancode-backend-ts',
  APP_VERSION: process.env.APP_VERSION || '1.0.0',
  APP_LOG_LEVEL: process.env.APP_LOG_LEVEL || 'info',
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE: {
    URL: process.env.DATABASE_URL,
    POOL: {
      MAX: parseNumber(process.env.DB_POOL_MAX, 20),
      MIN: parseNumber(process.env.DB_POOL_MIN, 5),
      IDLE_TIMEOUT_MS: parseNumber(process.env.DB_POOL_IDLE_TIMEOUT_MS, 60000),
      CONNECTION_TIMEOUT_MS: parseNumber(process.env.DB_POOL_CONN_TIMEOUT_MS, 2000),
    },
    SSL: {
      ENABLED: parseBoolean(process.env.DB_SSL_ENABLED, true),
      REJECT_UNAUTHORIZED: parseBoolean(process.env.DB_SSL_REJECT_UNAUTHORIZED, false),
    },
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || 'secret',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  },
  OTEL: {
    ENABLED: parseBoolean(process.env.OTEL_ENABLED, true),
    SERVICE_NAME: process.env.OTEL_SERVICE_NAME || process.env.APP_NAME || 'api',
    SERVICE_VERSION: process.env.OTEL_SERVICE_VERSION || process.env.APP_VERSION || '1.0.0',
    EXPORTER: {
      OTLP: {
        ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
        TRACES_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
        LOGS_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT,
      },
    },
    DIAG_LOG_LEVEL: process.env.OTEL_DIAG_LOG_LEVEL,
    ALLOW_BUN: parseBoolean(process.env.OTEL_ALLOW_BUN, false),
  },
  IS_PRODUCTION: process.env.APP_ENV === 'production',
  DOKU_CLIENT_ID: process.env.DOKU_CLIENT_ID,
  DOKU_SHARED_KEY: process.env.DOKU_SHARED_KEY,
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000/api',
}
