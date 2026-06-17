export interface TestServer {
  baseUrl: string
  requests: { method: string; url: string; body: string | null }[]
  shutdown(): void
}

type RouteHandler = (
  method: string,
  pathname: string,
  body: string | null,
) => Response | null

export function createTestServer(routes: RouteHandler): TestServer {
  const receivedRequests: { method: string; url: string; body: string | null }[] = []

  const server = Bun.serve({
    port: 0,
    async fetch(req) {
      const url = new URL(req.url)
      const body = req.method !== 'GET' && req.method !== 'DELETE'
        ? await req.text()
        : null

      receivedRequests.push({ method: req.method, url: req.url, body })

      const res = routes(req.method, url.pathname, body)
      if (res) return res

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
