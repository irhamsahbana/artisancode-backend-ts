// import { Library } from 'doku-nodejs-library'

import logger from '@/config/logger'

import { env } from '../config/env'

export interface DokuPaymentLinkReq {
  invoice_number: string
  amount: number
  customer_email: string
  customer_name: string
  expiry_time?: number // in minutes
}

export interface DokuPaymentLinkRes {
  invoice_id: string
  payment_url: string
}

interface DokuPaymentLinkPayload {
  order: {
    amount: number
    invoice_number: string
    currency: string
    callback_url: string
    auto_redirect: boolean
  }
  payment: {
    payment_due_date: number
  }
  customer: {
    name: string
    email: string
  }
}

// Minimal interface for DOKU Library since it lacks types
interface DokuLibrary {
  generatePaymentLink(payload: DokuPaymentLinkPayload): Promise<{
    order: { invoice_number: string }
    payment: { url: string }
  }>
}

export class DokuProvider {
  private client: DokuLibrary

  constructor() {
    // Initialize DOKU Library
    // Note: Assuming env vars are set: DOKU_CLIENT_ID, DOKU_SHARED_KEY, DOKU_IS_PRODUCTION
    // this.client = new Library({
    //   environment: env.IS_PRODUCTION ? 'production' : 'sandbox',
    //   clientId: env.DOKU_CLIENT_ID || 'dummy_client_id',
    //   sharedKey: env.DOKU_SHARED_KEY || 'dummy_shared_key',
    //   setupConfiguration: {
    //     json_body: true,
    //   },
    // }) as unknown as DokuLibrary
    this.client = {} as DokuLibrary
  }

  async generatePaymentLink(req: DokuPaymentLinkReq): Promise<DokuPaymentLinkRes> {
    try {
      const payload = {
        order: {
          amount: req.amount,
          invoice_number: req.invoice_number,
          currency: 'IDR',
          callback_url: `${env.API_BASE_URL}/webhooks/doku`, // Adjust as needed
          auto_redirect: true,
        },
        payment: {
          payment_due_date: req.expiry_time || 60 * 24 * 7, // Default 7 days in minutes
        },
        customer: {
          name: req.customer_name,
          email: req.customer_email,
        },
      }

      // Call DOKU API
      // Note: The library signature might vary, assuming generatePaymentLink or similar
      // For now, using a generic request wrapper if specific method unknown or specific endpoint
      // The library usually has .generatePaymentLink()

      const response = await this.client.generatePaymentLink(payload)

      return {
        invoice_id: response.order.invoice_number,
        payment_url: response.payment.url,
      }
    } catch (error) {
      logger.error('DOKU Generate Payment Link Error:', error)
      throw new Error('Failed to generate payment link')
    }
  }
}
