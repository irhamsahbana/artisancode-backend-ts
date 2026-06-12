import {
  context,
  diag,
  DiagConsoleLogger,
  DiagLogLevel,
  type Attributes,
  type Span,
  SpanStatusCode,
  trace,
} from '@opentelemetry/api'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'

import { env } from '@/config/env'

let sdk: NodeSDK | null = null

const parseHeaders = (raw: string | undefined): Record<string, string> | undefined => {
  if (!raw?.trim()) return undefined
  const headers: Record<string, string> = {}
  for (const pair of raw.split(',')) {
    const idx = pair.indexOf('=')
    if (idx === -1) continue
    const key = pair.slice(0, idx).trim()
    const value = pair.slice(idx + 1).trim()
    if (key) headers[key] = value
  }
  return Object.keys(headers).length > 0 ? headers : undefined
}

const getDiagLogLevel = (value: string | undefined) => {
  if (!value) return undefined
  const normalized = value.trim().toLowerCase()
  if (normalized === 'all') return DiagLogLevel.ALL
  if (normalized === 'verbose') return DiagLogLevel.VERBOSE
  if (normalized === 'debug') return DiagLogLevel.DEBUG
  if (normalized === 'info') return DiagLogLevel.INFO
  if (normalized === 'warn') return DiagLogLevel.WARN
  if (normalized === 'error') return DiagLogLevel.ERROR
  if (normalized === 'none') return DiagLogLevel.NONE
  return undefined
}

export const startTelemetry = () => {
  if (sdk) return

  const diagLogLevel = getDiagLogLevel(env.OTEL.DIAG_LOG_LEVEL)
  if (diagLogLevel !== undefined) {
    diag.setLogger(new DiagConsoleLogger(), diagLogLevel)
  }

  if (!env.OTEL.ENABLED) return

  const serviceName = env.OTEL.SERVICE_NAME || env.APP_NAME || 'api'
  const serviceVersion = env.OTEL.SERVICE_VERSION || env.APP_VERSION || '0.0.0'

  const resource = resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    [SemanticResourceAttributes.SERVICE_VERSION]: serviceVersion,
  })

  const traceExporterUrl =
    env.OTEL.EXPORTER.OTLP.TRACES_ENDPOINT ||
    (env.OTEL.EXPORTER.OTLP.ENDPOINT
      ? `${env.OTEL.EXPORTER.OTLP.ENDPOINT.replace(/\/$/, '')}/v1/traces`
      : undefined)

  const logExporterUrl =
    env.OTEL.EXPORTER.OTLP.LOGS_ENDPOINT ||
    (env.OTEL.EXPORTER.OTLP.ENDPOINT
      ? `${env.OTEL.EXPORTER.OTLP.ENDPOINT.replace(/\/$/, '')}/v1/logs`
      : undefined)

  const otlpHeaders = parseHeaders(env.OTEL.EXPORTER.OTLP.HEADERS)

  const traceExporter = new OTLPTraceExporter(
    traceExporterUrl
      ? {
          url: traceExporterUrl,
          headers: otlpHeaders,
        }
      : undefined,
  )

  const logExporter = logExporterUrl
    ? new OTLPLogExporter({ url: logExporterUrl, headers: otlpHeaders })
    : null

  sdk = new NodeSDK({
    resource,
    traceExporter,
    instrumentations: [
      new WinstonInstrumentation({
        disableLogSending: false,
        logHook: (_span, record) => {
          const activeSpan = trace.getSpan(context.active())
          const spanContext = activeSpan?.spanContext()
          if (!spanContext) return
          ;(record as unknown as Record<string, unknown>).trace_id = spanContext.traceId
          ;(record as unknown as Record<string, unknown>).span_id = spanContext.spanId
        },
      }),
    ],
    logRecordProcessors: logExporter ? [new BatchLogRecordProcessor(logExporter)] : [],
  })

  void sdk.start()
}

export const shutdownTelemetry = async () => {
  if (!sdk) return
  const current = sdk
  sdk = null
  await current.shutdown()
}

export const withSpan = async <T>(
  tracerName: string,
  spanName: string,
  fn: () => Promise<T> | T,
): Promise<T> => {
  const tracer = trace.getTracer(tracerName)
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

export type SpanAttributeSetter = Attributes | ((span: Span) => void)

export const withSpanAttributes = async <T>(
  tracerName: string,
  spanName: string,
  attributes: SpanAttributeSetter,
  fn: () => Promise<T> | T,
): Promise<T> => {
  const tracer = trace.getTracer(tracerName)
  return tracer.startActiveSpan(spanName, async (span) => {
    if (typeof attributes === 'function') {
      attributes(span)
    } else {
      span.setAttributes(attributes)
    }
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
