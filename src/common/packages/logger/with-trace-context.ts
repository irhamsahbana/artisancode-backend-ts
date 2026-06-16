import { context, trace } from '@opentelemetry/api'
import winston from 'winston'

/**
 * Winston format that injects OTel trace_id and span_id into every log line.
 *
 * OTel Winston transport destructures `level` out of the record and maps it
 * to severityText/severityNumber — the original `level` field never reaches
 * OTel attributes. We copy it to `log.level` so New Relic can pick it up.
 */
export const withTraceContext = winston.format((info) => {
  const span = trace.getSpan(context.active())
  const spanContext = span?.spanContext()
  if (spanContext) {
    (info as unknown as Record<string, unknown>).trace_id = spanContext.traceId;
    (info as unknown as Record<string, unknown>).span_id = spanContext.spanId;
  }
  // OTel transport strips `level` from attributes — use `log.level` instead
  // so New Relic (and other log viewers) can display it in the level column.
  if (info.level) {
    (info as unknown as Record<string, unknown>)['log.level'] = info.level;
  }
  return info
})
