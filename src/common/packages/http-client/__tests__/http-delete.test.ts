import { describe, it, expect, afterEach } from 'bun:test'

import { httpDelete } from '../index'
import { createTestServer } from './test-server'

describe('httpDelete', () => {
  const server = createTestServer((method, pathname) => {
    if (pathname === '/api/items' && method === 'DELETE') {
      return Response.json({ deleted: true })
    }
    return null
  })

  afterEach(() => {
    server.requests.length = 0
  })

  it('sends no body', async () => {
    const res = await httpDelete<{ deleted: boolean }>(
      server.baseUrl,
      '/api/items',
    )

    expect(res.status).toBe(200)
    expect(res.data).toEqual({ deleted: true })

    const req = server.requests.find((r) => r.method === 'DELETE')
    expect(req?.body).toBeNull()
  })
})
