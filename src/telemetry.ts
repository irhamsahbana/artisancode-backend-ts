import { context, diag, DiagConsoleLogger, DiagLogLevel, trace } from '@opentelemetry/api'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'

import { env } from '@/config/env'

let sdk: NodeSDK | null = null

const isBun =
  typeof (process as unknown as { versions?: { bun?: string } }).versions?.bun === 'string'

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

  if (isBun) {
    if (!env.OTEL.ALLOW_BUN) return
  }

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

  const traceExporter = new OTLPTraceExporter(
    traceExporterUrl
      ? {
          url: traceExporterUrl,
        }
      : undefined,
  )

  const logExporter = logExporterUrl ? new OTLPLogExporter({ url: logExporterUrl }) : null

  sdk = new NodeSDK({
    resource,
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-runtime-node': {
          enabled: !isBun,
        },
      }),
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
