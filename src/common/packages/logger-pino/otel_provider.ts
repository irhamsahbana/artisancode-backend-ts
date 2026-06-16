import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base'
import { resourceFromAttributes } from '@opentelemetry/resources'
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'

import { env } from '@/config/env'

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

let loggerProvider: LoggerProvider | null = null

export const initOtelLogProvider = () => {
  if (!env.OTEL.ENABLED) return null

  const logExporterUrl =
    env.OTEL.EXPORTER.OTLP.LOGS_ENDPOINT ||
    (env.OTEL.EXPORTER.OTLP.ENDPOINT
      ? `${env.OTEL.EXPORTER.OTLP.ENDPOINT.replace(/\/$/, '')}/v1/logs`
      : undefined)

  if (!logExporterUrl) return null

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: env.APP_NAME,
    [ATTR_SERVICE_VERSION]: env.APP_VERSION,
    'deployment.environment': env.APP_ENV,
  })

  const otlpHeaders = parseHeaders(env.OTEL.EXPORTER.OTLP.HEADERS)
  const compression = (env.OTEL.EXPORTER.OTLP.COMPRESSION || 'none') as CompressionAlgorithm

  const exporter = new OTLPLogExporter({
    url: logExporterUrl,
    headers: otlpHeaders,
    compression,
  })

  loggerProvider = new LoggerProvider({
    resource,
    processors: [new SimpleLogRecordProcessor(exporter)],
  })

  return loggerProvider
}

export const shutdownOtelLogProvider = async () => {
  if (loggerProvider) {
    await loggerProvider.shutdown()
    loggerProvider = null
  }
}
