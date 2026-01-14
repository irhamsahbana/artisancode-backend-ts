import 'dotenv/config'

const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) return defaultValue
  const normalized = value.trim().toLowerCase()
  if (normalized === 'true') return true
  if (normalized === 'false') return false
  return defaultValue
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
}
