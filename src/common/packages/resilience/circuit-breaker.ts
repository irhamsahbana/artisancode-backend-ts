import { circuitBreaker, ConsecutiveBreaker, handleWhen, isTaskCancelledError, type IPolicy, type IDefaultPolicyContext } from 'cockatiel'

import { AppError } from '@/common/packages/types'

import type { CircuitBreakerOptions } from './types'

function isCircuitBreakable(error: unknown): boolean {
  // Network errors (TypeError from fetch)
  if (error instanceof TypeError) {
    return true
  }

  // Timeout errors
  if (isTaskCancelledError(error)) {
    return true
  }

  // AppError with 5xx status
  if (error instanceof AppError && error.httpCode && error.httpCode >= 500) {
    return true
  }

  return false
}

export function createCircuitBreakerPolicy(
  options: CircuitBreakerOptions = {},
): IPolicy<IDefaultPolicyContext, unknown> {
  const { halfOpenAfter = 10_000, threshold = 5 } = options

  return circuitBreaker(handleWhen(isCircuitBreakable), {
    halfOpenAfter,
    breaker: new ConsecutiveBreaker(threshold),
  })
}
