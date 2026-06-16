interface FakeApiConfig {
  /** Number of consecutive failures before returning 200. Set to Infinity to always fail. */
  failUntilAttempt?: number
}

export function createFakeApi(config: FakeApiConfig = {}) {
  const receivedRequests: { method: string; path: string }[] = []
  let callCount = 0
  let failUntilAttempt = config.failUntilAttempt ?? Infinity

  const server = Bun.serve({
    port: 0,
    async fetch(req) {
      const url = new URL(req.url)
      const path = url.pathname

      receivedRequests.push({ method: req.method, path })

      if (path === '/health') {
        return Response.json({ status: 'ok' })
      }

      callCount++

      if (callCount <= failUntilAttempt) {
        return Response.json(
          { error: 'Service Unavailable', attempt: callCount },
          { status: 503 },
        )
      }

      // GET /orders/:id
      if (path.startsWith('/orders/')) {
        const id = path.split('/').pop()
        return Response.json({ id, name: `Order #${id}`, status: 'paid' })
      }

      // POST /orders
      if (path === '/orders' && req.method === 'POST') {
        const body = await req.json()
        return Response.json({ id: 100, ...body, status: 'created' }, { status: 201 })
      }

      return Response.json({ error: 'not found' }, { status: 404 })
    },
  })

  return {
    get baseUrl() {
      return `http://localhost:${server.port}`
    },
    get callCount() {
      return callCount
    },
    get requests() {
      return receivedRequests
    },
    setFailUntilAttempt(n: number) {
      failUntilAttempt = n
      callCount = 0
    },
    shutdown() {
      server.stop()
    },
  }
}

export type FakeApi = ReturnType<typeof createFakeApi>
