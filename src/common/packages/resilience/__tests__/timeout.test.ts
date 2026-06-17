import { describe, it, expect } from 'bun:test'
import { isTaskCancelledError } from 'cockatiel'

import { createTimeoutPolicy } from '..'

describe('Resilience — Timeout Policy', () => {
  it('resolves if function completes before timeout', async () => {
    const policy = createTimeoutPolicy({ duration: 1000 })

    const result = await policy.execute(async () => {
      return { success: true }
    })

    expect(result).toEqual({ success: true })
  })

  it('throws TaskCancelledError when function exceeds timeout', async () => {
    const policy = createTimeoutPolicy({ duration: 100 })

    let threw = false
    try {
      await policy.execute(async () => {
        await new Promise((r) => setTimeout(r, 500))
        return { success: true }
      })
    } catch (error) {
      threw = true
      expect(isTaskCancelledError(error)).toBe(true)
    }

    expect(threw).toBe(true)
  })

  it('uses custom duration', async () => {
    const policy = createTimeoutPolicy({ duration: 50 })

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

  it('does not abort signal when function completes normally', async () => {
    const policy = createTimeoutPolicy({ duration: 1000 })

    await policy.execute(async ({ signal }) => {
      // Signal should not be aborted if we complete in time
      expect(signal?.aborted).toBe(false)
      return { success: true }
    })
  })
})
