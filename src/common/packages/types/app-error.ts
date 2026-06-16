import type { ErrorCode } from './error-codes'

export class AppError extends Error {
  public readonly statusCode?: number
  public readonly code: ErrorCode
  public readonly errors?: unknown

  constructor(code: ErrorCode, message: string, options?: { statusCode?: number; errors?: unknown }) {
    super(message)
    this.code = code
    this.statusCode = options?.statusCode
    this.errors = options?.errors
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }

  /** Derive HTTP status from code when statusCode is not explicitly set. */
  toHttpStatus(): number {
    if (this.statusCode) return this.statusCode

    // General (2000–2099)
    if (this.code >= 2000 && this.code <= 2006) return 400
    if (this.code === 2007) return 500
    if (this.code === 2008) return 503

    // HTTP Client (2100–2199) → derive from code
    if (this.code >= 2100 && this.code <= 2199) return this.code - 2100 + 400

    // Auth (2200–2299)
    if (this.code >= 2200 && this.code <= 2202) return 401

    // Database (2300–2399)
    if (this.code === 2300) return 404
    if (this.code === 2301) return 409
    if (this.code === 2302) return 500

    // External Service (2400–2499)
    if (this.code >= 2400 && this.code <= 2402) return 502

    // Resilience (2500–2599)
    if (this.code === 2500) return 503
    if (this.code === 2501) return 503

    return 500
  }
}
