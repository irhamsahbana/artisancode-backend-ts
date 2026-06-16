import { context, trace } from '@opentelemetry/api'

export const addTraceContext = (): Record<string, string> | undefined => {
  const span = trace.getSpan(context.active())
  const spanContext = span?.spanContext()
  if (spanContext) {
    return {
      trace_id: spanContext.traceId,
      span_id: spanContext.spanId,
    }
  }
  return undefined
}
