import { DiagLogLevel } from '@opentelemetry/api'

export function getDiagLogLevel(value: string | undefined): DiagLogLevel | undefined {
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
