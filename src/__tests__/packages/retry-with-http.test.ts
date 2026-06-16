import { describe, it, expect, afterEach } from 'bun:test'

import { httpGet, httpPost, HttpError } from '@/common/packages/http-client'
import { createRetryPolicy } from '@/common/packages/resilience'

import { createFakeApi, type FakeApi } from './fake-api'

describe('Retry + HTTP Client', () => {
  let api: FakeApi

  afterEach(() => {
    api?.shutdown()
  })

  it('retries on 503 and succeeds on 3rd attempt', async () => {
    api = createFakeApi()
    api.setFailUntilAttempt(2)

    const policy = createRetryPolicy({ maxAttempts: 3 })

    const result = await policy.execute(async () => {
      const { data } = await httpGet<{ id: string; name: string }>(
        api.baseUrl,
        '/orders/1',
      )
      return data
    })

    expect(result).toEqual({ id: '1', name: 'Order #1', status: 'paid' })
    expect(api.callCount).toBe(3)
  })

  it('throws HttpError after exhausting retries', async () => {
    api = createFakeApi()
    api.setFailUntilAttempt(Infinity)

    const policy = createRetryPolicy({ maxAttempts: 3 })

    try {
      await policy.execute(async () => {
        const { data } = await httpGet(api.baseUrl, '/orders/1')
        return data
      })
      expect.unreachable('should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError)
      expect((error as HttpError).statusCode).toBe(503)
    }

    expect(api.callCount).toBe(4)
  })

  it('retries POST on failure and eventually succeeds', async () => {
    api = createFakeApi()
    api.setFailUntilAttempt(1)

    const policy = createRetryPolicy({ maxAttempts: 3 })

    const result = await policy.execute(async () => {
      const { data } = await httpPost<{ id: number; name: string; status: string }>(
        api.baseUrl,
        '/orders',
        { name: 'Test Order' },
      )
      return data
    })

    expect(result).toEqual({ id: 100, name: 'Test Order', status: 'created' })
  })
})
