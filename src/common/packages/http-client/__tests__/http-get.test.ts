import { describe, it, expect, afterEach } from 'bun:test'

import { httpGet } from '../index'
import { createTestServer } from './test-server'

describe('httpGet', () => {
  const server = createTestServer((method, pathname) => {
    if (pathname === '/api/items' && method === 'GET') {
      return Response.json({ items: [1, 2, 3] })
    }
    return null
  })

  afterEach(() => {
    server.requests.length = 0
  })

  it('fetches data', async () => {
    const res = await httpGet<{ items: number[] }>(server.baseUrl, '/api/items')

    expect(res.status).toBe(200)
    expect(res.data.items).toEqual([1, 2, 3])

    const req = server.requests.find((r) => r.method === 'GET')
    expect(req).toBeDefined()
  })
})
