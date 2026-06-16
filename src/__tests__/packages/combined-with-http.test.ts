import { describe, it, expect, afterEach } from 'bun:test'

import { httpGet } from '@/common/packages/http-client'
import {
  createRetryPolicy,
  createCircuitBreakerPolicy,
  wrapPolicies,
} from '@/common/packages/resilience'

import { createFakeApi, type FakeApi } from './fake-api'

describe('Retry + Circuit Breaker + HTTP Client', () => {
  let api: FakeApi

  afterEach(() => {
    api?.shutdown()
  })

  it('retry heals before circuit breaker trips', async () => {
    api = createFakeApi()
    api.setFailUntilAttempt(1)

    const retryPolicy = createRetryPolicy({ maxAttempts: 3 })
    const cbPolicy = createCircuitBreakerPolicy({ threshold: 5 })
    const policy = wrapPolicies(retryPolicy, cbPolicy)

    const result = await policy.execute(async () => {
      const { data } = await httpGet<{ id: string; name: string; status: string }>(
        api.baseUrl,
        '/orders/1',
      )
      return data
    })

    expect(result).toEqual({ id: '1', name: 'Order #1', status: 'paid' })
    expect(api.callCount).toBe(2)
  })

  it('circuit breaker trips when all retries fail', async () => {
    api = createFakeApi()
    api.setFailUntilAttempt(Infinity)

    const retryPolicy = createRetryPolicy({ maxAttempts: 3 })
    const cbPolicy = createCircuitBreakerPolicy({ threshold: 3 })
    const policy = wrapPolicies(retryPolicy, cbPolicy)

    const errors: Error[] = []

    try {
      await policy.execute(async () => {
        const { data } = await httpGet(api.baseUrl, '/orders/1')
        return data
      })
    } catch {
      errors.push(new Error('first call failed'))
    }

    expect(api.callCount).toBe(3)

    try {
      await policy.execute(async () => {
        const { data } = await httpGet(api.baseUrl, '/orders/1')
        return data
      })
    } catch {
      errors.push(new Error('second call rejected'))
    }

    expect(errors).toHaveLength(2)
    expect(api.callCount).toBe(3) // no new HTTP calls
  })
})
