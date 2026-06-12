// Generic payment gateway types — provider-agnostic
// Concrete implementations (e.g. DOKU) map their responses to these types

export interface GeneratePaymentLinkReq {
  invoice_number: string
  amount: number
  customer_email: string
  customer_name: string
  customer_phone?: string
  customer_address?: string
  customer_country?: string
  line_items?: { name: string; price: number; quantity: number }[]
  expiry_time?: number // in minutes
}

export interface GeneratePaymentLinkRes {
  invoice_id: string
  payment_url: string
  request_id: string
}

export interface CheckStatusRes {
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

export interface IPaymentGateway {
  generatePaymentLink(req: GeneratePaymentLinkReq): Promise<GeneratePaymentLinkRes>
  checkStatus(invoiceNumber: string): Promise<CheckStatusRes>
  verifyNotificationSignature(
    headers: Record<string, string | string[] | undefined>,
    body: string,
    targetPath: string,
  ): boolean
}
