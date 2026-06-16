import { SpanStatusCode, trace } from '@opentelemetry/api'
import { routePath } from 'hono/route'

import type { AppEnv } from '../types'
import type { Context, Next } from 'hono'

export interface HttpSpanOptions {
  /** Tracer name — defaults to "http". */
  tracerName?: string
}

/**
 * Creates an OpenTelemetry span for every HTTP request.
 *
 * Uses routePath (pattern) for `http.route` to keep cardinality low.
 * e.g. `/users/:id` instead of `/users/123`.
 *
 * NOTE: routePath is only accurate AFTER route matching (i.e. after next()).
 * We create the span early to capture the full request lifecycle, then update
 * the name and http.route attribute once the route is known.
 */
export const httpSpan = (options?: HttpSpanOptions) => {
  const tracer = trace.getTracer(options?.tracerName ?? 'http')

  return async (c: Context<AppEnv>, next: Next) => {
    const method = c.req.method

    return tracer.startActiveSpan(`${method} /*`, async (span) => {
      try {
        span.setAttribute('http.method', method)
        span.setAttribute('http.url', c.req.url)
        span.setAttribute('http.user_agent', c.req.header('user-agent') || '')

        await next()

        span.setAttribute('http.status_code', c.res.status)

        if (c.res.status >= 400) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: `HTTP ${c.res.status}`,
          })
        }
      } catch (error) {
        span.recordException(error as Error)
        span.setStatus({ code: SpanStatusCode.ERROR })
        throw error
      } finally {
        // routePath is accurate only after route matching (after next())
        // — runs in finally so it works even when next() throws.
        const route = routePath(c) || 'unmatched_route'
        span.updateName(`${method} ${route}`)
        span.setAttribute('http.route', route)
        span.end()
      }
    })
  }
}
