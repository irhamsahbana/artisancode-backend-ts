import { ErrorCode } from './error-codes'

import type { RestResponse } from './rest-response'

const ERROR_TO_HTTP_STATUS: Record<ErrorCode, number> = {
  // ── General ─────────────────────────────────────────
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.TOO_MANY_REQUESTS]: 429,
  [ErrorCode.REQUEST_TIMEOUT]: 408,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.NOT_IMPLEMENTED]: 501,

  // ── HTTP Client ──────────────────────────────────────
  [ErrorCode.HTTP_BAD_REQUEST]: 400,
  [ErrorCode.HTTP_UNAUTHORIZED]: 401,
  [ErrorCode.HTTP_FORBIDDEN]: 403,
  [ErrorCode.HTTP_NOT_FOUND]: 404,
  [ErrorCode.HTTP_TIMEOUT]: 408,
  [ErrorCode.HTTP_INTERNAL_ERROR]: 500,
  [ErrorCode.NETWORK_ERROR]: 502,
  [ErrorCode.HTTP_TOO_MANY_REQUESTS]: 429,
  [ErrorCode.HTTP_BAD_GATEWAY]: 502,
  [ErrorCode.HTTP_SERVICE_UNAVAILABLE]: 503,

  // ── Auth ─────────────────────────────────────────────
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 401,
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 401,
  [ErrorCode.AUTH_TOKEN_INVALID]: 401,

  // ── Database ─────────────────────────────────────────
  [ErrorCode.DB_RECORD_NOT_FOUND]: 404,
  [ErrorCode.DB_DUPLICATE_ENTRY]: 409,
  [ErrorCode.DB_TRANSACTION_FAILED]: 500,

  // ── External Service ─────────────────────────────────
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
  [ErrorCode.PAYMENT_GATEWAY_ERROR]: 502,
  [ErrorCode.STORAGE_ERROR]: 502,

  // ── Resilience ───────────────────────────────────────
  [ErrorCode.CIRCUIT_BREAKER_OPEN]: 503,
  [ErrorCode.RESILIENCE_EXHAUSTED]: 503,

  // ── Invoice ──────────────────────────────────────────
  [ErrorCode.INVOICE_NOT_FOUND]: 404,
  [ErrorCode.INVOICE_ALREADY_PAID]: 409,
  [ErrorCode.INVOICE_EXPIRED]: 409,
  [ErrorCode.INVOICE_PAYMENT_FAILED]: 402,
  [ErrorCode.INVOICE_STATUS_INVALID]: 409,

  // ── Enrollment ───────────────────────────────────────
  [ErrorCode.ENROLLMENT_NOT_FOUND]: 404,

  // ── Company ──────────────────────────────────────────
  [ErrorCode.COMPANY_NOT_FOUND]: 404,

  // ── Role ─────────────────────────────────────────────
  [ErrorCode.ROLE_COMPANY_REQUIRED]: 400,

  // ── Program ──────────────────────────────────────────
  [ErrorCode.PROGRAM_PRICE_NOT_FOUND]: 404,
}

export class AppError extends Error {
  public readonly httpCode?: number
  public readonly code: ErrorCode
  public readonly errors?: unknown
  public readonly data?: unknown

  constructor(code: ErrorCode, message: string, options?: { httpCode?: number; errors?: unknown; data?: unknown }) {
    super(message)
    this.code = code
    this.httpCode = options?.httpCode
    this.data = options?.data
    this.errors = options?.errors
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }

  /** Derive HTTP status from code when httpCode is not explicitly set. */
  toHttpStatus(): number {
    if (this.httpCode) return this.httpCode
    return ERROR_TO_HTTP_STATUS[this.code] ?? 500
  }

  getHttpResponse(): RestResponse {
    return {
      errors: this.errors,
      success: false,
      message: this.message,
      data: null,
    }
  }

  getErrorResponse() {
    return {
      code: this.code,
      message: this.message,
      errors: this.errors,
      data: this.data,
    }
  }
}