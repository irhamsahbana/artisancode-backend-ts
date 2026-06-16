import { AppError, ErrorCode } from '@/common/packages/types'

export class CircuitBreakerError extends AppError {
  constructor(message = 'Service unavailable due to open circuit breaker') {
    super(ErrorCode.CIRCUIT_BREAKER_OPEN, message, { statusCode: 503 })
    this.name = 'CircuitBreakerError'
  }
}

export class ResilienceExhaustedError extends AppError {
  constructor(message = 'All retry attempts exhausted') {
    super(ErrorCode.RESILIENCE_EXHAUSTED, message, { statusCode: 503 })
    this.name = 'ResilienceExhaustedError'
  }
}
