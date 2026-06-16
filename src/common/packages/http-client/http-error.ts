import { AppError } from '@/common/packages/types'
import { ErrorCode } from '@/common/packages/types/error-codes'

const HTTP_CODE_MAP: Record<number, ErrorCode> = {
  400: ErrorCode.HTTP_BAD_REQUEST,
  401: ErrorCode.HTTP_UNAUTHORIZED,
  403: ErrorCode.HTTP_FORBIDDEN,
  404: ErrorCode.HTTP_NOT_FOUND,
  408: ErrorCode.HTTP_TIMEOUT,
  500: ErrorCode.HTTP_INTERNAL_ERROR,
}

export class HttpError extends AppError {
  public readonly statusText: string

  constructor(httpCode: number, statusText: string, data?: unknown) {
    const code = HTTP_CODE_MAP[httpCode] ?? (2100 + httpCode) as ErrorCode
    super(code, `HTTP ${httpCode} ${statusText}`, {
      httpCode,
      errors: data,
    })
    this.statusText = statusText
    this.name = 'HttpError'
  }
}
