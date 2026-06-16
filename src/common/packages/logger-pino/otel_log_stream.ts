import { Writable } from 'stream'

import { mapToLogRecord } from './log_record_mapper'

import type { LoggerProvider } from '@opentelemetry/sdk-logs'

/**
 * A Writable stream that sends Pino logs to OpenTelemetry.
 * Runs in the main thread — acceptable at moderate log volumes.
 * At very high scale, consider pino.transport() with bun-plugin-pino.
 */
export class OtelLogStream extends Writable {
  private provider: LoggerProvider | null

  constructor(provider: LoggerProvider | null) {
    super({ objectMode: true })
    this.provider = provider
  }

  _write(chunk: unknown, _encoding: BufferEncoding, callback: (error?: Error | null) => void) {
    if (!this.provider) {
      callback()
      return
    }

    try {
      const log = typeof chunk === 'string' ? JSON.parse(chunk) : chunk
      const record = mapToLogRecord(log)
      const logger = this.provider.getLogger('pino')
      logger.emit(record)
      callback()
    } catch {
      callback()
    }
  }
}
