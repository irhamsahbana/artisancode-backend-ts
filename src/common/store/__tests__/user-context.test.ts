import { describe, it, expect } from 'bun:test'

import type { JwtPayload } from '@/common/packages/types'

import { getUserContext, runWithUserContext } from '../user-context'

const mockUser: JwtPayload = {
  id: 'user-123',
  company_id: 'company-456',
  branch_id: 'branch-789',
  role_id: 'role-001',
  name: 'Test User',
  username: 'testuser',
}

describe('UserContext (AsyncLocalStorage)', () => {
  it('returns undefined when outside any context', () => {
    const user = getUserContext()
    expect(user).toBeUndefined()
  })

  it('returns user inside runWithUserContext', async () => {
    const result = await runWithUserContext(mockUser, async () => {
      return getUserContext()
    })

    expect(result).toEqual(mockUser)
  })

  it('returns undefined after context scope ends', async () => {
    await runWithUserContext(mockUser, async () => {
      // Inside context
      expect(getUserContext()).toEqual(mockUser)
    })

    // Outside context
    expect(getUserContext()).toBeUndefined()
  })

  it('propagates user through nested async calls', async () => {
    async function nestedCall() {
      return getUserContext()
    }

    async function middleLayer() {
      return nestedCall()
    }

    const result = await runWithUserContext(mockUser, async () => {
      return middleLayer()
    })

    expect(result).toEqual(mockUser)
  })

  it('supports concurrent contexts isolation', async () => {
    const user1: JwtPayload = { ...mockUser, id: 'user-1', name: 'User 1' }
    const user2: JwtPayload = { ...mockUser, id: 'user-2', name: 'User 2' }

    const results = await Promise.all([
      runWithUserContext(user1, async () => {
        // Simulate async work
        await new Promise((r) => setTimeout(r, 10))
        return getUserContext()
      }),
      runWithUserContext(user2, async () => {
        // Simulate async work
        await new Promise((r) => setTimeout(r, 5))
        return getUserContext()
      }),
    ])

    expect(results[0]?.id).toBe('user-1')
    expect(results[1]?.id).toBe('user-2')
  })

  it('returns the result from the callback', async () => {
    const result = await runWithUserContext(mockUser, async () => {
      return 'hello'
    })

    expect(result).toBe('hello')
  })

  it('propagates errors from callback', async () => {
    await expect(
      runWithUserContext(mockUser, async () => {
        throw new Error('test error')
      }),
    ).rejects.toThrow('test error')
  })
})
