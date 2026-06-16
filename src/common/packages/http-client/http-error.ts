import { AppError } from '@/common/app_error'
import { ErrorCode } from '@/common/types/error-codes'

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

  constructor(statusCode: number, statusText: string, data?: unknown) {
    const code = HTTP_CODE_MAP[statusCode] ?? `HTTP_${statusCode}` as ErrorCode
    super(statusCode, `HTTP ${statusCode} ${statusText}`, {
      code,
      errors: data,
    })
    this.statusText = statusText
    this.name = 'HttpError'
  }
}
