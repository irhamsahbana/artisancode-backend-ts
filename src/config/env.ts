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
  APP_LOGGER: (process.env.APP_LOGGER || 'winston') as 'winston' | 'pino',
  IS_PRODUCTION: process.env.APP_ENV === 'production',
  CORS: {
    ORIGINS: (process.env.CORS_ORIGINS || '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean),
    ALLOW_CREDENTIALS: parseBoolean(process.env.CORS_ALLOW_CREDENTIALS, true),
  },
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
    ENABLED: parseBoolean(process.env.OTEL_ENABLED, false),
    SAMPLING_RATIO: parseFloat(process.env.OTEL_SAMPLING_RATIO || '1'),
    EXPORTER: {
      OTLP: {
        ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
        TRACES_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
        LOGS_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT,
        HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS,
        COMPRESSION: process.env.OTEL_EXPORTER_OTLP_COMPRESSION || 'none',
      },
    },
    DIAG_LOG_LEVEL: process.env.OTEL_DIAG_LOG_LEVEL,
  },
  DOKU: {
    CLIENT_ID: process.env.DOKU_CLIENT_ID,
    SECRET_KEY: process.env.DOKU_SECRET_KEY,
    PUBLIC_KEY: process.env.DOKU_PUBLIC_KEY,
  },
  S3: {
    BUCKET: process.env.S3_BUCKET || '',
    REGION: process.env.S3_REGION || 'ap-southeast-1',
    ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID || '',
    SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY || '',
    ENDPOINT: process.env.S3_ENDPOINT || undefined,
    PUBLIC_BASE_URL: process.env.S3_PUBLIC_BASE_URL || '',
  },
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000/api',
}
