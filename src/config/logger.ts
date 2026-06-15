import path from 'path'

import { context, trace } from '@opentelemetry/api'
import winston from 'winston'

import { env } from './env'

const { combine, timestamp } = winston.format

const withTraceContext = winston.format((info) => {
  const span = trace.getSpan(context.active())
  const spanContext = span?.spanContext()
  if (spanContext) {
    (info as unknown as Record<string, unknown>).trace_id = spanContext.traceId;
    (info as unknown as Record<string, unknown>).span_id = spanContext.spanId;
  }
  return info
})

const withSourceLocation = winston.format((info) => {
  const err = new Error()
  const stack = err.stack?.split('\n') || []
  // cari frame pertama yang bukan dari logger.ts atau node_modules
  for (const line of stack) {
    const match = line.match(/\s+at\s+(.+):(\d+):\d+/)
    if (match) {
      const filePath = match[1]
      const lineNo = match[2]
      // skip internal frames
      if (
        filePath.includes('logger.ts') ||
        filePath.includes('node_modules') ||
        filePath.includes('telemetry.ts')
      ) {
        continue
      }
      // ambil path relatif dari src/ terakhir (buang duplikat src/sobatbisnis/api/src/)
      const lastSrcIndex = filePath.lastIndexOf('src/')
      const relativePath = lastSrcIndex !== -1 ? filePath.slice(lastSrcIndex) : path.basename(filePath)
      ;(info as unknown as Record<string, unknown>).location = `${relativePath}:${lineNo}`
      break
    }
  }
  return info
})

const logger = winston.createLogger({
  level: env.APP_LOG_LEVEL || 'info',
  format: combine(timestamp(), withTraceContext(), withSourceLocation(), winston.format.json()),
  transports: [
    new winston.transports.Console(),
    // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
})

export default logger
