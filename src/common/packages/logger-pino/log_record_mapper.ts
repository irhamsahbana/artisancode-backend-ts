const severityMap: Record<string, { text: string; number: number }> = {
  trace: { text: 'TRACE', number: 1 },
  debug: { text: 'DEBUG', number: 5 },
  info: { text: 'INFO', number: 9 },
  warn: { text: 'WARN', number: 13 },
  error: { text: 'ERROR', number: 17 },
  fatal: { text: 'FATAL', number: 21 },
}

export const mapToLogRecord = (log: Record<string, unknown>): Record<string, unknown> => {
  const level = typeof log.level === 'string' ? log.level : 'info'
  const severity = severityMap[level] || { text: 'INFO', number: 9 }

  const { time, msg, location, trace_id, span_id, ...rest } = log

  const attrs: Record<string, string> = { level }
  if (trace_id) attrs.trace_id = trace_id as string
  if (span_id) attrs.span_id = span_id as string
  if (location) attrs.location = location as string
  for (const [k, v] of Object.entries(rest)) {
    attrs[k] = String(v)
  }

  const record: Record<string, unknown> = {
    severityText: severity.text,
    severityNumber: severity.number,
    timestamp: time ? new Date(time as string) : new Date(),
    body: (msg as string) || '',
    attributes: attrs,
  }
  if (trace_id) {
    record.traceId = trace_id as string
    record.spanId = span_id as string
  }

  return record
}
