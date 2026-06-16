import { describe, it, expect, afterEach } from 'bun:test'

import { httpGet, httpPost, httpPut, httpPatch, httpDelete } from '../index'

// ── Fake HTTP Server ─────────────────────────────────────────────────────────

function createTestServer() {
  const receivedRequests: { method: string; url: string; body: string | null }[] = []

  const server = Bun.serve({
    port: 0,
    async fetch(req) {
      const url = new URL(req.url)
      const body = req.method !== 'GET' && req.method !== 'DELETE'
        ? await req.text()
        : null

      receivedRequests.push({ method: req.method, url: req.url, body })

      if (url.pathname === '/api/items') {
        if (req.method === 'GET') {
          return Response.json({ items: [1, 2, 3] })
        }
        if (req.method === 'POST') {
          const data = JSON.parse(body ?? '{}')
          return Response.json({ id: 1, ...data }, { status: 201 })
        }
        if (req.method === 'PUT') {
          const data = JSON.parse(body ?? '{}')
          return Response.json({ id: 1, ...data })
        }
        if (req.method === 'PATCH') {
          const data = JSON.parse(body ?? '{}')
          return Response.json({ id: 1, ...data })
        }
        if (req.method === 'DELETE') {
          return Response.json({ deleted: true })
        }
      }

      return Response.json({ error: 'not found' }, { status: 404 })
    },
  })

  return {
    get baseUrl() {
      return `http://localhost:${server.port}`
    },
    get requests() {
      return receivedRequests
    },
    shutdown() {
      server.stop()
    },
  }
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('Convenience methods', () => {
  let server: ReturnType<typeof createTestServer>

  afterEach(() => {
    server?.shutdown()
  })

  it('httpGet fetches data', async () => {
    server = createTestServer()

    const res = await httpGet<{ items: number[] }>(server.baseUrl, '/api/items')

    expect(res.status).toBe(200)
    expect(res.data.items).toEqual([1, 2, 3])

    const req = server.requests.find((r) => r.method === 'GET')
    expect(req).toBeDefined()
  })

  it('httpPost sends body and returns data', async () => {
    server = createTestServer()

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

  it('httpPut sends body', async () => {
    server = createTestServer()

    const res = await httpPut<{ id: number; name: string }>(
      server.baseUrl,
      '/api/items',
      { name: 'updated' },
    )

    expect(res.status).toBe(200)
    expect(res.data).toEqual({ id: 1, name: 'updated' })
  })

  it('httpPatch sends body', async () => {
    server = createTestServer()

    const res = await httpPatch<{ id: number; name: string }>(
      server.baseUrl,
      '/api/items',
      { name: 'patched' },
    )

    expect(res.status).toBe(200)
    expect(res.data).toEqual({ id: 1, name: 'patched' })
  })

  it('httpDelete sends no body', async () => {
    server = createTestServer()

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
