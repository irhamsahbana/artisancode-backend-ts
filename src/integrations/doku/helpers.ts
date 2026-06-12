import crypto from 'crypto'

import type { DokuClientConfig } from './client'

// HMAC-SHA256 signature for POST requests (includes body digest)
export function generateSignature(
  config: DokuClientConfig,
  payload: string,
  timestamp: string,
  requestId: string,
  targetPath: string,
): string {
  const digest = crypto.createHash('sha256').update(payload).digest('base64')

  const component =
    `Client-Id:${config.clientId}\n` +
    `Request-Id:${requestId}\n` +
    `Request-Timestamp:${timestamp}\n` +
    `Request-Target:${targetPath}\n` +
    `Digest:${digest}`

  const signature = crypto.createHmac('sha256', config.secretKey).update(component).digest('base64')

  return `HMACSHA256=${signature}`
}

// HMAC-SHA256 signature for GET requests (no body digest)
export function generateGetSignature(
  config: DokuClientConfig,
  timestamp: string,
  requestId: string,
  targetPath: string,
): string {
  const component =
    `Client-Id:${config.clientId}\n` +
    `Request-Id:${requestId}\n` +
    `Request-Timestamp:${timestamp}\n` +
    `Request-Target:${targetPath}`

  const signature = crypto.createHmac('sha256', config.secretKey).update(component).digest('base64')

  return `HMACSHA256=${signature}`
}

export function generateRequestId(): string {
  return crypto.randomUUID()
}

export function generateTimestamp(): string {
  return new Date().toISOString().slice(0, 19) + 'Z'
}
