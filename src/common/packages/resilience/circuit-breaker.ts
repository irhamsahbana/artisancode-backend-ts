import { circuitBreaker, handleAll, ConsecutiveBreaker, type IPolicy, type IDefaultPolicyContext } from 'cockatiel'

import type { CircuitBreakerOptions } from './types'

export function createCircuitBreakerPolicy(
  options: CircuitBreakerOptions = {},
): IPolicy<IDefaultPolicyContext, unknown> {
  const { halfOpenAfter = 10_000, threshold = 5 } = options

  return circuitBreaker(handleAll, {
    halfOpenAfter,
    breaker: new ConsecutiveBreaker(threshold),
  })
}
