import pino from 'pino'

import { env } from '@/config/env'

import { OtelLogStream } from './otel_log_stream'
import { initOtelLogProvider } from './otel_provider'
import { addSourceLocation } from './source-location'
import { addTraceContext } from './trace-context'
import { wrap } from './wrap'

const loggerOptions: pino.LoggerOptions = {
  level: env.APP_LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
  mixin() {
    return {
      ...addTraceContext(),
      ...addSourceLocation(),
    }
  },
}

// Initialize OTel log provider (main thread, no worker threads)
const otelProvider = initOtelLogProvider()

let pinoLogger: pino.Logger

if (otelProvider) {
  const otelStream = new OtelLogStream(otelProvider)
  const streams = pino.multistream([
    { stream: process.stdout, level: loggerOptions.level as pino.LevelWithSilent },
    { stream: otelStream, level: loggerOptions.level as pino.LevelWithSilent },
  ])
  pinoLogger = pino(loggerOptions, streams)
} else {
  pinoLogger = pino(loggerOptions)
}

const logger = {
  info: wrap(pinoLogger.info.bind(pinoLogger), pinoLogger),
  warn: wrap(pinoLogger.warn.bind(pinoLogger), pinoLogger),
  error: wrap(pinoLogger.error.bind(pinoLogger), pinoLogger),
  debug: wrap(pinoLogger.debug.bind(pinoLogger), pinoLogger),
  trace: wrap(pinoLogger.trace.bind(pinoLogger), pinoLogger),
  fatal: wrap(pinoLogger.fatal.bind(pinoLogger), pinoLogger),
  level: pinoLogger.level,
}

export default logger
