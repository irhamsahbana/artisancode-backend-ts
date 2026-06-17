import { describe, it, expect, afterEach } from 'bun:test'

import { AppError } from '@/common/packages/types'

import { httpClient } from '../index'

// ── Fake HTTP Server ─────────────────────────────────────────────────────────

function createTestServer() {
  const receivedRequests: { method: string; url: string; headers: Record<string, string>; body: string | null }[] = []

  const server = Bun.serve({
    port: 0,
    async fetch(req) {
      const url = new URL(req.url)
      const headers: Record<string, string> = {}
      req.headers.forEach((v, k) => { headers[k] = v })

      const body = req.method !== 'GET' && req.method !== 'DELETE'
        ? await req.text()
        : null

      receivedRequests.push({ method: req.method, url: req.url, headers, body })

      // ── Route handling ──

      // Health check
      if (url.pathname === '/health') {
        return Response.json({ status: 'ok' })
      }

      // JSON response
      if (url.pathname === '/api/users') {
        if (req.method === 'GET') {
          const page = url.searchParams.get('page') ?? '1'
          const limit = url.searchParams.get('limit') ?? '10'
          return Response.json({ users: [{ id: 1, name: 'Alice' }], page, limit })
        }
        if (req.method === 'POST') {
          const data = JSON.parse(body ?? '{}')
          return Response.json({ id: 2, ...data }, { status: 201 })
        }
        if (req.method === 'PUT') {
          const data = JSON.parse(body ?? '{}')
          return Response.json({ id: 1, ...data })
        }
        if (req.method === 'PATCH') {
          const data = JSON.parse(body ?? '{}')
          return Response.json({ id: 1, ...data })
        }
      }

      // Single user
      if (url.pathname === '/api/users/1') {
        if (req.method === 'GET') {
          return Response.json({ id: 1, name: 'Alice' })
        }
        if (req.method === 'DELETE') {
          return Response.json({ deleted: true })
        }
      }

      // Error responses
      if (url.pathname === '/api/error/400') {
        return Response.json({ error: 'bad request' }, { status: 400 })
      }
      if (url.pathname === '/api/error/404') {
        return Response.json({ error: 'not found' }, { status: 404 })
      }
      if (url.pathname === '/api/error/500') {
        return Response.json({ error: 'server error' }, { status: 500 })
      }

      // Text response
      if (url.pathname === '/api/text') {
        return new Response('hello world', {
          headers: { 'content-type': 'text/plain' },
        })
      }

      // No content-type header (fallback to text)
      if (url.pathname === '/api/no-content-type') {
        return new Response('raw data')
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

describe('httpClient', () => {
  let server: ReturnType<typeof createTestServer>

  afterEach(() => {
    server?.shutdown()
  })

  // ── GET ──

  describe('GET requests', () => {
    it('fetches JSON data successfully', async () => {
      server = createTestServer()

      const res = await httpClient<{ id: number; name: string }>(
        server.baseUrl,
        '/api/users/1',
      )

      expect(res.status).toBe(200)
      expect(res.data).toEqual({ id: 1, name: 'Alice' })
      expect(res.statusText).toBe('OK')
    })

    it('sends query parameters', async () => {
      server = createTestServer()

      const res = await httpClient<{ page: string; limit: string }>(
        server.baseUrl,
        '/api/users',
        { query: { page: 2, limit: 5 } },
      )

      expect(res.data.page).toBe('2')
      expect(res.data.limit).toBe('5')
    })

    it('sends custom headers', async () => {
      server = createTestServer()

      await httpClient(server.baseUrl, '/api/users/1', {
        headers: { 'X-Custom': 'test-value' },
      })

      const req = server.requests.find((r) => r.url.includes('/api/users/1'))
      expect(req?.headers['x-custom']).toBe('test-value')
    })

    it('skips null/undefined query params', async () => {
      server = createTestServer()

      await httpClient(server.baseUrl, '/api/users', {
        query: { page: 1, search: undefined, sort: null },
      })

      const req = server.requests.find((r) => r.url.includes('/api/users'))
      expect(req).toBeDefined()
      const url = new URL(req?.url ?? '')
      expect(url.searchParams.get('page')).toBe('1')
      expect(url.searchParams.has('search')).toBe(false)
      expect(url.searchParams.has('sort')).toBe(false)
    })
  })

  // ── POST / PUT / PATCH / DELETE ──

  describe('Mutation requests', () => {
    it('POST sends JSON body', async () => {
      server = createTestServer()

      const res = await httpClient<{ id: number; name: string }>(
        server.baseUrl,
        '/api/users',
        { method: 'POST', body: { name: 'Bob' } },
      )

      expect(res.status).toBe(201)
      expect(res.data).toEqual({ id: 2, name: 'Bob' })

      const req = server.requests.find((r) => r.method === 'POST')
      expect(req).toBeDefined()
      expect(req?.headers['content-type']).toContain('application/json')
      expect(JSON.parse(req?.body ?? '{}')).toEqual({ name: 'Bob' })
    })

    it('PUT sends JSON body', async () => {
      server = createTestServer()

      const res = await httpClient<{ id: number; name: string }>(
        server.baseUrl,
        '/api/users',
        { method: 'PUT', body: { name: 'Updated' } },
      )

      expect(res.status).toBe(200)
      expect(res.data).toEqual({ id: 1, name: 'Updated' })
    })

    it('PATCH sends JSON body', async () => {
      server = createTestServer()

      const res = await httpClient<{ id: number; name: string }>(
        server.baseUrl,
        '/api/users',
        { method: 'PATCH', body: { name: 'Patched' } },
      )

      expect(res.status).toBe(200)
      expect(res.data).toEqual({ id: 1, name: 'Patched' })
    })

    it('DELETE sends no body', async () => {
      server = createTestServer()

      const res = await httpClient<{ deleted: boolean }>(
        server.baseUrl,
        '/api/users/1',
        { method: 'DELETE' },
      )

      expect(res.status).toBe(200)
      expect(res.data).toEqual({ deleted: true })

      const req = server.requests.find((r) => r.method === 'DELETE')
      expect(req?.body).toBeNull()
    })
  })

  // ── Error handling ──

  describe('Error handling', () => {
    it('throws AppError on 400', async () => {
      server = createTestServer()

      try {
        await httpClient(server.baseUrl, '/api/error/400')
        expect.unreachable('should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(AppError)
        const appErr = error as AppError
        expect(appErr.httpCode).toBe(400)
        expect(appErr.message).toContain('400')
      }
    })

    it('throws AppError on 404', async () => {
      server = createTestServer()

      try {
        await httpClient(server.baseUrl, '/api/error/404')
        expect.unreachable('should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(AppError)
        const appErr = error as AppError
        expect(appErr.httpCode).toBe(404)
      }
    })

    it('throws AppError on 500', async () => {
      server = createTestServer()

      try {
        await httpClient(server.baseUrl, '/api/error/500')
        expect.unreachable('should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(AppError)
        const appErr = error as AppError
        expect(appErr.httpCode).toBe(500)
      }
    })

    it('includes response body in AppError', async () => {
      server = createTestServer()

      try {
        await httpClient(server.baseUrl, '/api/error/400')
        expect.unreachable('should have thrown')
      } catch (error) {
        const appErr = error as AppError
        expect(appErr.data).toEqual({ error: 'bad request' })
      }
    })
  })

  // ── Response parsing ──

  describe('Response parsing', () => {
    it('parses JSON responses', async () => {
      server = createTestServer()

      const res = await httpClient<{ id: number }>(server.baseUrl, '/api/users/1')
      expect(typeof res.data).toBe('object')
      expect(res.data.id).toBe(1)
    })

    it('parses text responses', async () => {
      server = createTestServer()

      const res = await httpClient<string>(server.baseUrl, '/api/text')
      expect(res.data).toBe('hello world')
    })

    it('handles missing content-type as text', async () => {
      server = createTestServer()

      const res = await httpClient<string>(server.baseUrl, '/api/no-content-type')
      expect(res.data).toBe('raw data')
    })

    it('returns headers in response', async () => {
      server = createTestServer()

      const res = await httpClient(server.baseUrl, '/api/users/1')
      expect(res.headers).toBeInstanceOf(Headers)
      expect(res.headers.get('content-type')).toContain('application/json')
    })
  })
})
