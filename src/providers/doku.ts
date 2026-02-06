import crypto from 'crypto'

import { env } from '@/config/env'
import logger from '@/config/logger'

export interface DokuLineItem {
  name: string
  price: number
  quantity: number
}

export interface DokuPaymentLinkReq {
  invoice_number: string
  amount: number
  customer_email: string
  customer_name: string
  customer_phone?: string
  customer_address?: string
  customer_country?: string
  line_items?: DokuLineItem[]
  expiry_time?: number // in minutes
}

export interface DokuPaymentLinkRes {
  invoice_id: string
  payment_url: string
  request_id: string
}

export interface DokuCheckStatusRes {
  order?: {
    invoice_number?: string
    amount?: number
    status?: string
  }
  transaction?: {
    status?: string
    date?: string
    original_request_id?: string
  }
}

interface DokuCheckoutResponse {
  message: string[]
  response: {
    order: {
      invoice_number: string
      amount: number
    }
    payment: {
      url: string
    }
  }
}

export class DokuProvider {
  private clientId: string
  private secretKey: string
  private publicKey: string
  private baseUrl: string

  constructor() {
    this.clientId = env.DOKU.CLIENT_ID || ''
    this.secretKey = env.DOKU.SECRET_KEY || ''

    // Decode Public Key as requested (even if not used for Checkout API directly, might be needed for other ops)
    const encodedPublicKey = env.DOKU.PUBLIC_KEY || ''
    this.publicKey = encodedPublicKey
      ? Buffer.from(encodedPublicKey, 'base64').toString('utf-8')
      : ''

    this.baseUrl = env.IS_PRODUCTION ? 'https://api.doku.com' : 'https://api-sandbox.doku.com'
  }

  private generateSignature(
    payload: string,
    timestamp: string,
    requestId: string,
    targetPath: string,
  ): string {
    const digest = crypto.createHash('sha256').update(payload).digest('base64')

    const component =
      `Client-Id:${this.clientId}\n` +
      `Request-Id:${requestId}\n` +
      `Request-Timestamp:${timestamp}\n` +
      `Request-Target:${targetPath}\n` +
      `Digest:${digest}`

    const signature = crypto.createHmac('sha256', this.secretKey).update(component).digest('base64')

    return `HMACSHA256=${signature}`
  }

  private generateGetSignature(timestamp: string, requestId: string, targetPath: string): string {
    const component =
      `Client-Id:${this.clientId}\n` +
      `Request-Id:${requestId}\n` +
      `Request-Timestamp:${timestamp}\n` +
      `Request-Target:${targetPath}`

    const signature = crypto.createHmac('sha256', this.secretKey).update(component).digest('base64')

    return `HMACSHA256=${signature}`
  }

  public verifyNotificationSignature(
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

    // Calculate Digest
    const digest = crypto.createHash('sha256').update(body).digest('base64')

    // Construct Component
    const component =
      `Client-Id:${clientId}\n` +
      `Request-Id:${requestId}\n` +
      `Request-Timestamp:${timestamp}\n` +
      `Request-Target:${targetPath}\n` +
      `Digest:${digest}`

    // Calculate Expected Signature
    const expectedSignature =
      'HMACSHA256=' + crypto.createHmac('sha256', this.secretKey).update(component).digest('base64')

    return signature === expectedSignature
  }

  async generatePaymentLink(req: DokuPaymentLinkReq): Promise<DokuPaymentLinkRes> {
    const targetPath = '/checkout/v1/payment'
    const url = `${this.baseUrl}${targetPath}`
    const requestId = crypto.randomUUID()
    const timestamp = new Date().toISOString().slice(0, 19) + 'Z'

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
    const signature = this.generateSignature(payloadStr, timestamp, requestId, targetPath)

    try {
      logger.info(`Generating DOKU Payment Link for ${req.invoice_number}`)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Client-Id': this.clientId,
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

  async checkStatus(invoiceNumber: string): Promise<DokuCheckStatusRes> {
    const targetPath = `/orders/v1/status/${invoiceNumber}`
    const url = `${this.baseUrl}${targetPath}`
    const requestId = crypto.randomUUID()
    const timestamp = new Date().toISOString().slice(0, 19) + 'Z'
    const signature = this.generateGetSignature(timestamp, requestId, targetPath)

    try {
      logger.info(`Checking DOKU status for ${invoiceNumber}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Client-Id': this.clientId,
          'Request-Id': requestId,
          'Request-Timestamp': timestamp,
          Signature: signature,
        },
      })

      const responseBody = (await response.json()) as DokuCheckStatusRes

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
}
