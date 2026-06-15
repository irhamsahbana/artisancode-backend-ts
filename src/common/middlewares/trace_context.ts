import { context, propagation, trace } from '@opentelemetry/api'
import { Context, Next } from 'hono'

/**
 * Middleware that extracts W3C Trace Context (traceparent/tracestate)
 * from incoming HTTP request headers and sets it as the active context.
 *
 * This enables distributed tracing — all spans created downstream
 * (in handlers, repositories, etc.) will be children of the incoming trace.
 */
export const traceContext = async (c: Context, next: Next) => {
  const carrier: Record<string, string> = {}
  // Extract trace headers from incoming request
  c.req.raw.headers.forEach((value, key) => {
    carrier[key] = value
  })

  const extractedContext = propagation.extract(context.active(), carrier)

  // Run the rest of the middleware chain within the extracted context
  await context.with(extractedContext, async () => {
    // Set trace_id on context for downstream use (e.g., logging)
    const span = trace.getSpan(context.active())
    const traceId = span?.spanContext()?.traceId
    if (traceId) {
      c.set('traceId', traceId)
    }
    await next()
  })
}
