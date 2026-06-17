import { describe, it, expect, afterEach } from 'bun:test'

import { httpPut } from '../index'
import { createTestServer } from './test-server'

describe('httpPut', () => {
  const server = createTestServer((method, pathname, body) => {
    if (pathname === '/api/items' && method === 'PUT') {
      const data = JSON.parse(body ?? '{}')
      return Response.json({ id: 1, ...data })
    }
    return null
  })

  afterEach(() => {
    server.requests.length = 0
  })

  it('sends body', async () => {
    const res = await httpPut<{ id: number; name: string }>(
      server.baseUrl,
      '/api/items',
      { name: 'updated' },
    )

    expect(res.status).toBe(200)
    expect(res.data).toEqual({ id: 1, name: 'updated' })
  })
})
