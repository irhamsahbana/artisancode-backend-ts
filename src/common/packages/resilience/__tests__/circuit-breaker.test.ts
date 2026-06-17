import { describe, it, expect, afterEach } from 'bun:test'

import { AppError, ErrorCode } from '@/common/packages/types'

import { createCircuitBreakerPolicy } from '..'
import { createFakeService, type FakeService } from './fake-service'

describe('Resilience — Circuit Breaker Policy', () => {
  let service: FakeService

  afterEach(() => {
    service?.shutdown()
  })

  it('trips after threshold consecutive failures', async () => {
    service = createFakeService({ failUntilAttempt: Infinity })

    const policy = createCircuitBreakerPolicy({
      threshold: 3,
      halfOpenAfter: 500,
    })

    const errors: Error[] = []

    for (let i = 0; i < 4; i++) {
      try {
        await policy.execute(async () => {
          const res = await fetch(`${service.baseUrl}/api/orders/1`)
          if (!res.ok) throw new AppError(ErrorCode.HTTP_INTERNAL_ERROR, `HTTP ${res.status}`, { httpCode: res.status })
          return res.json()
        })
      } catch (err) {
        errors.push(err as Error)
      }
    }

    expect(errors.length).toBe(4)
    expect(service.callCount).toBe(3) // only 3 hit the server, 4th rejected by circuit breaker
  })

  it('rejects immediately when circuit is open (no HTTP call)', async () => {
    service = createFakeService({ failUntilAttempt: Infinity })

    const policy = createCircuitBreakerPolicy({
      threshold: 2,
      halfOpenAfter: 500,
    })

    // Trip the circuit breaker
    for (let i = 0; i < 2; i++) {
      try {
        await policy.execute(async () => {
          const res = await fetch(`${service.baseUrl}/api/orders/1`)
          if (!res.ok) throw new AppError(ErrorCode.HTTP_INTERNAL_ERROR, `HTTP ${res.status}`, { httpCode: res.status })
          return res.json()
        })
      } catch {
        // expected
      }
    }

    const countBefore = service.callCount

    // This should be rejected by the circuit breaker without hitting the server
    try {
      await policy.execute(async () => {
        const res = await fetch(`${service.baseUrl}/api/orders/1`)
        if (!res.ok) throw new AppError(ErrorCode.HTTP_INTERNAL_ERROR, `HTTP ${res.status}`, { httpCode: res.status })
        return res.json()
      })
    } catch {
      // expected
    }

    expect(service.callCount).toBe(countBefore) // no new HTTP calls
  })

  it('recovers after half-open period', async () => {
    service = createFakeService({ failUntilAttempt: Infinity })

    const policy = createCircuitBreakerPolicy({
      threshold: 2,
      halfOpenAfter: 300,
    })

    // Trip the circuit breaker
    for (let i = 0; i < 2; i++) {
      try {
        await policy.execute(async () => {
          const res = await fetch(`${service.baseUrl}/api/orders/1`)
          if (!res.ok) throw new AppError(ErrorCode.HTTP_INTERNAL_ERROR, `HTTP ${res.status}`, { httpCode: res.status })
          return res.json()
        })
      } catch {
        // expected
      }
    }

    // Wait for half-open period to elapse
    await new Promise((r) => setTimeout(r, 400))

    // Now the server should succeed — switch to no failures
    service.shutdown()
    service = createFakeService({ failUntilAttempt: 0 })

    // Re-create policy pointing to the new server
    const recoveryPolicy = createCircuitBreakerPolicy({
      threshold: 2,
      halfOpenAfter: 300,
    })

    const result = (await recoveryPolicy.execute(async () => {
      const res = await fetch(`${service.baseUrl}/api/orders/1`)
      if (!res.ok) throw new AppError(ErrorCode.HTTP_INTERNAL_ERROR, `HTTP ${res.status}`, { httpCode: res.status })
      return res.json()
    })) as { status: string }

    expect(result.status).toBe('success')
  })
})
