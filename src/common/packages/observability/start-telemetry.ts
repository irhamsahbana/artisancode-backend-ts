import { diag, DiagConsoleLogger } from '@opentelemetry/api'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston'
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { ParentBasedSampler, TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'

import { env } from '@/config/env'

import { getDiagLogLevel } from './get-diag-log-level'
import { parseHeaders } from './parse-headers'
import { getSdk, setSdk } from './sdk-state'

export const startTelemetry = () => {
  if (getSdk()) return

  const diagLogLevel = getDiagLogLevel(env.OTEL.DIAG_LOG_LEVEL)
  if (diagLogLevel !== undefined) {
    diag.setLogger(new DiagConsoleLogger(), diagLogLevel)
  }

  if (!env.OTEL.ENABLED) return

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: env.APP_NAME,
    [ATTR_SERVICE_VERSION]: env.APP_VERSION,
    'deployment.environment': env.APP_ENV,
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
  const compression = (env.OTEL.EXPORTER.OTLP.COMPRESSION || 'none') as CompressionAlgorithm

  const traceExporter = new OTLPTraceExporter(
    traceExporterUrl
      ? {
          url: traceExporterUrl,
          headers: otlpHeaders,
          compression,
        }
      : undefined,
  )

  const logExporter = logExporterUrl
    ? new OTLPLogExporter({ url: logExporterUrl, headers: otlpHeaders, compression })
    : null

  const sampler = new ParentBasedSampler({
    root: new TraceIdRatioBasedSampler(env.OTEL.SAMPLING_RATIO),
  })

  const sdk = new NodeSDK({
    resource,
    traceExporter,
    sampler,
    instrumentations: [
      new WinstonInstrumentation({
        disableLogSending: false,
      }),
    ],
    logRecordProcessors: logExporter ? [new BatchLogRecordProcessor(logExporter)] : [],
  })

  setSdk(sdk)
  void sdk.start()
}
