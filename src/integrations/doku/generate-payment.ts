import { env } from '@/config/env'
import logger from '@/config/logger'
import { GeneratePaymentLinkReq, GeneratePaymentLinkRes } from '@/contracts/integration'

import { generateRequestId, generateSignature, generateTimestamp } from './helpers'

import type { DokuClientConfig } from './client'
import type { DokuCheckoutResponse } from './types'

export async function generatePaymentLink(
  config: DokuClientConfig,
  req: GeneratePaymentLinkReq,
): Promise<GeneratePaymentLinkRes> {
  const targetPath = '/checkout/v1/payment'
  const url = `${config.baseUrl}${targetPath}`
  const requestId = generateRequestId()
  const timestamp = generateTimestamp()

  const payloadObj = {
    order: {
      amount: req.amount,
      invoice_number: req.invoice_number,
      currency: 'IDR',
      callback_url: `${env.API_BASE_URL}/webhooks/doku`,
      auto_redirect: true,
      line_items: req.line_items,
    },
    payment: {
      payment_due_date: req.expiry_time || 10080, // Default 7 days
    },
    customer: {
      name: req.customer_name,
      email: req.customer_email,
      phone: req.customer_phone,
      address: req.customer_address,
      country: req.customer_country || 'ID',
    },
  }

  const payloadStr = JSON.stringify(payloadObj)
  const signature = generateSignature(config, payloadStr, timestamp, requestId, targetPath)

  try {
    logger.info(`Generating DOKU Payment Link for ${req.invoice_number}`)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': config.clientId,
        'Request-Id': requestId,
        'Request-Timestamp': timestamp,
        Signature: signature,
      },
      body: payloadStr,
    })

    const responseBody = (await response.json()) as DokuCheckoutResponse

    if (!response.ok) {
      logger.error('DOKU API Error Response:', responseBody)
      throw new Error(`DOKU API Error: ${JSON.stringify(responseBody)}`)
    }

    return {
      invoice_id: responseBody.response.order.invoice_number,
      payment_url: responseBody.response.payment.url,
      request_id: requestId,
    }
  } catch (error) {
    logger.error('DOKU Generate Payment Link Error:', error)
    throw error
  }
}
