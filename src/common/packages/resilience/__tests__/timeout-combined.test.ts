import { describe, it, expect } from 'bun:test'
import { isTaskCancelledError } from 'cockatiel'

import {
  createRetryPolicy,
  createCircuitBreakerPolicy,
  createTimeoutPolicy,
  wrapPolicies,
} from '..'

describe('Resilience — Timeout + Retry Combined', () => {
  it('retries when timeout occurs', async () => {
    let attempt = 0
    const retryPolicy = createRetryPolicy({ maxAttempts: 3 })
    const timeoutPolicy = createTimeoutPolicy({ duration: 50 })
    const policy = wrapPolicies(retryPolicy, timeoutPolicy)

    const result = await policy.execute(async () => {
      attempt++
      if (attempt === 1) {
        await new Promise((r) => setTimeout(r, 200))
      }
      return { success: true, attempt }
    })

    expect(result).toEqual({ success: true, attempt: 2 })
    expect(attempt).toBe(2)
  })

  it('throws after all retries exhausted on timeout', async () => {
    const retryPolicy = createRetryPolicy({ maxAttempts: 2 })
    const timeoutPolicy = createTimeoutPolicy({ duration: 50 })
    const policy = wrapPolicies(retryPolicy, timeoutPolicy)

    let threw = false
    try {
      await policy.execute(async () => {
        await new Promise((r) => setTimeout(r, 200))
        return { success: true }
      })
    } catch (error) {
      threw = true
      expect(isTaskCancelledError(error)).toBe(true)
    }

    expect(threw).toBe(true)
  })
})

describe('Resilience — Timeout + Circuit Breaker Combined', () => {
  it('circuit breaker trips after repeated timeouts', async () => {
    const cbPolicy = createCircuitBreakerPolicy({
      threshold: 2,
      halfOpenAfter: 1000,
    })
    const timeoutPolicy = createTimeoutPolicy({ duration: 50 })
    const policy = wrapPolicies(cbPolicy, timeoutPolicy)

    const errors: Error[] = []

    for (let i = 0; i < 3; i++) {
      try {
        await policy.execute(async () => {
          await new Promise((r) => setTimeout(r, 200))
        })
      } catch (error) {
        errors.push(error as Error)
      }
    }

    expect(errors.length).toBe(3)
    expect(isTaskCancelledError(errors[0])).toBe(true)
    expect(isTaskCancelledError(errors[1])).toBe(true)
    expect(errors[2].constructor.name).toBe('BrokenCircuitError')
  })
})

describe('Resilience — Timeout + Retry + Circuit Breaker Combined', () => {
  it('retries timeout, then circuit breaker trips after multiple calls', async () => {
    const retryPolicy = createRetryPolicy({ maxAttempts: 2 })
    const cbPolicy = createCircuitBreakerPolicy({
      threshold: 2,
      halfOpenAfter: 1000,
    })
    const timeoutPolicy = createTimeoutPolicy({ duration: 50 })
    const policy = wrapPolicies(cbPolicy, retryPolicy, timeoutPolicy)

    const errors: Error[] = []

    for (let i = 0; i < 3; i++) {
      try {
        await policy.execute(async () => {
          await new Promise((r) => setTimeout(r, 200))
        })
      } catch (error) {
        errors.push(error as Error)
      }
    }

    expect(errors.length).toBe(3)
    expect(isTaskCancelledError(errors[0])).toBe(true)
    expect(isTaskCancelledError(errors[1])).toBe(true)
    expect(errors[2].constructor.name).toBe('BrokenCircuitError')
  })
})
