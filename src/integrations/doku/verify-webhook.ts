import crypto from 'crypto'

import logger from '@/config/logger'

import type { DokuClientConfig } from './client'

export function verifyNotificationSignature(
  config: DokuClientConfig,
  headers: Record<string, string | string[] | undefined>,
  body: string,
  targetPath: string,
): boolean {
  const clientId = headers['client-id'] as string
  const requestId = headers['request-id'] as string
  const timestamp = headers['request-timestamp'] as string
  const signature = headers['signature'] as string

  if (!clientId || !requestId || !timestamp || !signature) {
    logger.warn('DOKU Webhook missing required headers', { headers })
    return false
  }

  const digest = crypto.createHash('sha256').update(body).digest('base64')

  const component =
    `Client-Id:${clientId}\n` +
    `Request-Id:${requestId}\n` +
    `Request-Timestamp:${timestamp}\n` +
    `Request-Target:${targetPath}\n` +
    `Digest:${digest}`

  const expectedSignature =
    'HMACSHA256=' + crypto.createHmac('sha256', config.secretKey).update(component).digest('base64')

  return signature === expectedSignature
}
