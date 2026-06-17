import { AppError, ErrorCode } from '@/common/packages/types'

export class CircuitBreakerError extends AppError {
  constructor(message = 'Service unavailable due to open circuit breaker') {
    super(ErrorCode.CIRCUIT_BREAKER_OPEN, message, { httpCode: 503 })
    this.name = 'CircuitBreakerError'
  }
}

export class TimeoutError extends AppError {
  constructor(message = 'Request timed out') {
    super(ErrorCode.HTTP_TIMEOUT, message, { httpCode: 408 })
    this.name = 'TimeoutError'
  }
}
