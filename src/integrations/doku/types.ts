// DOKU-specific internal types (not exported to consumers — use contract types instead)

export interface DokuCheckoutResponse {
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
