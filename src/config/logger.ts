import { context, trace } from '@opentelemetry/api'
import winston from 'winston'

import { env } from './env'

const { combine, timestamp, printf, colorize } = winston.format

const withTraceContext = winston.format((info) => {
  const span = trace.getSpan(context.active())
  const spanContext = span?.spanContext()
  if (spanContext) {
    ;(info as unknown as Record<string, unknown>).trace_id = spanContext.traceId
    ;(info as unknown as Record<string, unknown>).span_id = spanContext.spanId
  }
  return info
})

const devFormat = combine(
  colorize(),
  timestamp({
    format: 'HH:mm:ss.SSS',
  }),
  withTraceContext(),
  printf((info) => {
    const traceId = (info as unknown as { trace_id?: string }).trace_id
    const spanId = (info as unknown as { span_id?: string }).span_id
    const trace = traceId && spanId ? ` trace_id=${traceId} span_id=${spanId}` : ''
    return `[${info.timestamp}] ${info.level}: ${info.message}${trace}`
  }),
)

const prodFormat = combine(withTraceContext(), timestamp(), winston.format.json())

const logger = winston.createLogger({
  level: env.APP_LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
})

export default logger
