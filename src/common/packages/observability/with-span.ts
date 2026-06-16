import { SpanStatusCode, trace } from '@opentelemetry/api'

export interface WithSpanOptions {
  tracerName?: string
}

export const withSpan = async <T>(
  spanName: string,
  fn: () => Promise<T> | T,
  options?: WithSpanOptions,
): Promise<T> => {
  const tracer = trace.getTracer(options?.tracerName ?? 'default')
  return tracer.startActiveSpan(spanName, async (span) => {
    try {
      return await fn()
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({ code: SpanStatusCode.ERROR })
      throw error
    } finally {
      span.end()
    }
  })
}
