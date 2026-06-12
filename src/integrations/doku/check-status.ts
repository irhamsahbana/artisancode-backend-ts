import logger from '@/config/logger'
import { CheckStatusRes } from '@/contracts/integration'

import { generateGetSignature, generateRequestId, generateTimestamp } from './helpers'

import type { DokuClientConfig } from './client'

export async function checkStatus(
  config: DokuClientConfig,
  invoiceNumber: string,
): Promise<CheckStatusRes> {
  const targetPath = `/orders/v1/status/${invoiceNumber}`
  const url = `${config.baseUrl}${targetPath}`
  const requestId = generateRequestId()
  const timestamp = generateTimestamp()
  const signature = generateGetSignature(config, timestamp, requestId, targetPath)

  try {
    logger.info(`Checking DOKU status for ${invoiceNumber}`)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Client-Id': config.clientId,
        'Request-Id': requestId,
        'Request-Timestamp': timestamp,
        Signature: signature,
      },
    })

    const responseBody = (await response.json()) as CheckStatusRes

    if (!response.ok) {
      logger.error('DOKU Status API Error Response:', responseBody)
      throw new Error(`DOKU Status API Error: ${JSON.stringify(responseBody)}`)
    }

    return responseBody
  } catch (error) {
    logger.error('DOKU Status Check Error:', error)
    throw error
  }
}
