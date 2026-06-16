import type { ErrorCode } from './error-codes'

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: ErrorCode
  public readonly errors?: unknown

  constructor(statusCode: number, message: string, options?: { code?: ErrorCode; errors?: unknown }) {
    super(message)
    this.statusCode = statusCode
    this.code = options?.code ?? `ERROR_${statusCode}` as ErrorCode
    this.errors = options?.errors
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}
