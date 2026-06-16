import { ErrorCode } from '@/common/packages/types'

/**
 * Invoice-specific error codes.
 * Centralized in error-codes.ts for now, but can be moved here when splitting.
 */
export const InvoiceErrorCode = {
  NOT_FOUND: ErrorCode.INVOICE_NOT_FOUND,
  ALREADY_PAID: ErrorCode.INVOICE_ALREADY_PAID,
  EXPIRED: ErrorCode.INVOICE_EXPIRED,
  PAYMENT_FAILED: ErrorCode.INVOICE_PAYMENT_FAILED,
  STATUS_INVALID: ErrorCode.INVOICE_STATUS_INVALID,
} as const

export type InvoiceErrorCode = (typeof InvoiceErrorCode)[keyof typeof InvoiceErrorCode]
