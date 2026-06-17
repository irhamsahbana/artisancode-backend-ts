import { describe, it, expect, afterEach } from 'bun:test'

import { httpPatch } from '../index'
import { createTestServer } from './test-server'

describe('httpPatch', () => {
  const server = createTestServer((method, pathname, body) => {
    if (pathname === '/api/items' && method === 'PATCH') {
      const data = JSON.parse(body ?? '{}')
      return Response.json({ id: 1, ...data })
    }
    return null
  })

  afterEach(() => {
    server.requests.length = 0
  })

  it('sends body', async () => {
    const res = await httpPatch<{ id: number; name: string }>(
      server.baseUrl,
      '/api/items',
      { name: 'patched' },
    )

    expect(res.status).toBe(200)
    expect(res.data).toEqual({ id: 1, name: 'patched' })
  })
})
