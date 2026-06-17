import { describe, it, expect, afterEach } from 'bun:test'

import { AppError, ErrorCode } from '@/common/packages/types'

import { createRetryPolicy } from '..'
import { createFakeService, type FakeService } from './fake-service'

describe('Resilience — Retry Policy', () => {
  let service: FakeService

  afterEach(() => {
    service?.shutdown()
  })

  it('retries on failure and eventually succeeds', async () => {
    service = createFakeService({ failUntilAttempt: 2 })

    const policy = createRetryPolicy({ maxAttempts: 3 })

    const result = await policy.execute(async () => {
      const res = await fetch(`${service.baseUrl}/api/orders/1`)
      if (!res.ok) throw new AppError(ErrorCode.HTTP_INTERNAL_ERROR, `HTTP ${res.status}`, { httpCode: res.status })
      return res.json()
    })

    expect(result).toEqual({ id: 1, name: 'Order #3', status: 'success' })
    expect(service.callCount).toBe(3)
  })

  it('throws after exhausting all retry attempts', async () => {
    service = createFakeService({ failUntilAttempt: Infinity })

    const policy = createRetryPolicy({ maxAttempts: 3 })

    const errors: Error[] = []
    try {
      await policy.execute(async () => {
        const res = await fetch(`${service.baseUrl}/api/orders/1`)
        if (!res.ok) throw new AppError(ErrorCode.HTTP_INTERNAL_ERROR, `HTTP ${res.status}`, { httpCode: res.status })
        return res.json()
      })
    } catch (err) {
      errors.push(err as Error)
    }

    expect(errors.length).toBe(1)
    // maxAttempts=3 means 1 initial + 3 retries = 4 total calls
    expect(service.callCount).toBe(4)
  })

  it('does not retry on success', async () => {
    service = createFakeService({ failUntilAttempt: 0 })

    const policy = createRetryPolicy({ maxAttempts: 3 })

    const result = await policy.execute(async () => {
      const res = await fetch(`${service.baseUrl}/api/orders/1`)
      if (!res.ok) throw new AppError(ErrorCode.HTTP_INTERNAL_ERROR, `HTTP ${res.status}`, { httpCode: res.status })
      return res.json()
    })

    expect(result).toEqual({ id: 1, name: 'Order #1', status: 'success' })
    expect(service.callCount).toBe(1)
  })
})
