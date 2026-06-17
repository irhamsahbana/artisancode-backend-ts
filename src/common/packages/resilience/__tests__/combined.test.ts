import { describe, it, expect, afterEach } from 'bun:test'

import { AppError, ErrorCode } from '@/common/packages/types'

import {
  createRetryPolicy,
  createCircuitBreakerPolicy,
  wrapPolicies,
} from '..'
import { createFakeService, type FakeService } from './fake-service'

describe('Resilience — Combined Retry + Circuit Breaker', () => {
  let service: FakeService

  afterEach(() => {
    service?.shutdown()
  })

  it('retry succeeds before circuit breaker trips', async () => {
    service = createFakeService({ failUntilAttempt: 1 })

    const retryPolicy = createRetryPolicy({ maxAttempts: 3 })
    const cbPolicy = createCircuitBreakerPolicy({ threshold: 5 })
    const policy = wrapPolicies(retryPolicy, cbPolicy)

    const result = await policy.execute(async () => {
      const res = await fetch(`${service.baseUrl}/api/orders/1`)
      if (!res.ok) throw new AppError(ErrorCode.HTTP_INTERNAL_ERROR, `HTTP ${res.status}`, { httpCode: res.status })
      return res.json()
    })

    expect(result).toEqual({ id: 1, name: 'Order #2', status: 'success' })
    expect(service.callCount).toBe(2)
  })

  it('circuit breaker trips when all retries fail repeatedly', async () => {
    service = createFakeService({ failUntilAttempt: Infinity })

    const retryPolicy = createRetryPolicy({ maxAttempts: 3 })
    const cbPolicy = createCircuitBreakerPolicy({ threshold: 3 })
    const policy = wrapPolicies(retryPolicy, cbPolicy)

    const errors: Error[] = []

    try {
      await policy.execute(async () => {
        const res = await fetch(`${service.baseUrl}/api/orders/1`)
        if (!res.ok) throw new AppError(ErrorCode.HTTP_INTERNAL_ERROR, `HTTP ${res.status}`, { httpCode: res.status })
        return res.json()
      })
    } catch {
      errors.push(new Error('first call failed'))
    }

    // Circuit breaker threshold=3 trips after 3 consecutive failures.
    // The retry policy attempts 4 times (1 initial + 3 retries), but the circuit
    // breaker counts each failure and trips on the 3rd, blocking the 4th attempt.
    expect(service.callCount).toBe(3)

    // Second call: circuit breaker should be open → rejected immediately
    try {
      await policy.execute(async () => {
        const res = await fetch(`${service.baseUrl}/api/orders/1`)
        if (!res.ok) throw new AppError(ErrorCode.HTTP_INTERNAL_ERROR, `HTTP ${res.status}`, { httpCode: res.status })
        return res.json()
      })
    } catch {
      errors.push(new Error('second call rejected'))
    }

    expect(errors.length).toBe(2)
    expect(service.callCount).toBe(3) // no new HTTP calls on second call
  })
})
