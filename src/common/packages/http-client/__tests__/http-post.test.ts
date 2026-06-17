import { describe, it, expect, afterEach } from 'bun:test'

import { httpPost } from '../index'
import { createTestServer } from './test-server'

describe('httpPost', () => {
  const server = createTestServer((method, pathname, body) => {
    if (pathname === '/api/items' && method === 'POST') {
      const data = JSON.parse(body ?? '{}')
      return Response.json({ id: 1, ...data }, { status: 201 })
    }
    return null
  })

  afterEach(() => {
    server.requests.length = 0
  })

  it('sends body and returns data', async () => {
    const res = await httpPost<{ id: number; name: string }>(
      server.baseUrl,
      '/api/items',
      { name: 'new item' },
    )

    expect(res.status).toBe(201)
    expect(res.data).toEqual({ id: 1, name: 'new item' })

    const req = server.requests.find((r) => r.method === 'POST')
    expect(req).toBeDefined()
    expect(JSON.parse(req?.body ?? '{}')).toEqual({ name: 'new item' })
  })
})
