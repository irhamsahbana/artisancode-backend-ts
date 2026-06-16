import { describe, it, expect, afterEach } from 'bun:test'

import { httpGet } from '@/common/packages/http-client'
import { createCircuitBreakerPolicy } from '@/common/packages/resilience'

import { createFakeApi, type FakeApi } from './fake-api'

describe('Circuit Breaker + HTTP Client', () => {
  let api: FakeApi

  afterEach(() => {
    api?.shutdown()
  })

  it('trips after threshold and rejects subsequent calls', async () => {
    api = createFakeApi()
    api.setFailUntilAttempt(Infinity)

    const policy = createCircuitBreakerPolicy({
      threshold: 3,
      halfOpenAfter: 500,
    })

    const errors: Error[] = []

    for (let i = 0; i < 4; i++) {
      try {
        await policy.execute(async () => {
          const { data } = await httpGet(api.baseUrl, '/orders/1')
          return data
        })
      } catch (err) {
        errors.push(err as Error)
      }
    }

    expect(errors).toHaveLength(4)
    expect(errors[3].message).toContain('circuit breaker')
    expect(api.callCount).toBe(3) // only 3 hit the server
  })
})
