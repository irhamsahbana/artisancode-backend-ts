import { describe, it, expect, beforeEach } from 'bun:test'
import { Hono } from 'hono'

import { generateToken } from '@/common/jwt'
import type { JwtPayload } from '@/common/packages/types'
import { getUserContext } from '@/common/store/user-context'

import { authenticate } from '../auth.middleware'

const mockUser: JwtPayload = {
  id: 'user-123',
  company_id: 'company-456',
  branch_id: 'branch-789',
  role_id: 'role-001',
  name: 'Test User',
  username: 'testuser',
}

function createTestApp() {
  const app = new Hono()
  app.use('/*', authenticate)
  app.get('/protected', (c) => {
    const user = getUserContext()
    return c.json({ user })
  })
  return app
}

describe('Auth Middleware', () => {
  let app: Hono

  beforeEach(() => {
    app = createTestApp()
  })

  it('returns 401 when authorization header is missing', async () => {
    const res = await app.request('/protected')
    expect(res.status).toBe(401)
  })

  it('returns 401 when token is missing after Bearer', async () => {
    const res = await app.request('/protected', {
      headers: { authorization: 'Bearer ' },
    })
    expect(res.status).toBe(401)
  })

  it('returns 401 for invalid token', async () => {
    const res = await app.request('/protected', {
      headers: { authorization: 'Bearer invalid-token' },
    })
    expect(res.status).toBe(401)
  })

  it('sets user context for valid token', async () => {
    const token = generateToken(mockUser)

    const res = await app.request('/protected', {
      headers: { authorization: `Bearer ${token}` },
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.user.id).toBe(mockUser.id)
    expect(body.user.company_id).toBe(mockUser.company_id)
    expect(body.user.username).toBe(mockUser.username)
  })

  it('propagates user context to nested async calls', async () => {
    const appWithNested = new Hono()
    appWithNested.use('/*', authenticate)
    appWithNested.get('/protected', async (c) => {
      // Simulate nested async call
      async function deepCall() {
        return getUserContext()
      }
      const user = await deepCall()
      return c.json({ user })
    })

    const token = generateToken(mockUser)
    const res = await appWithNested.request('/protected', {
      headers: { authorization: `Bearer ${token}` },
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.user.id).toBe(mockUser.id)
  })

  it('user context is cleared after request completes', async () => {
    const token = generateToken(mockUser)

    await app.request('/protected', {
      headers: { authorization: `Bearer ${token}` },
    })

    // After request, context should be cleared
    const user = getUserContext()
    expect(user).toBeUndefined()
  })
})
