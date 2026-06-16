interface FakeServiceConfig {
  /** Number of consecutive failures before returning 200. Set to Infinity to always fail. */
  failUntilAttempt?: number
  /** Delay in ms before responding (simulates slow service). */
  responseDelay?: number
}

export function createFakeService(config: FakeServiceConfig = {}) {
  const { failUntilAttempt = Infinity, responseDelay = 0 } = config
  let callCount = 0

  const server = Bun.serve({
    port: 0, // auto-assign
    async fetch(req) {
      const url = new URL(req.url)

      if (url.pathname === '/health') {
        return Response.json({ status: 'ok' })
      }

      callCount++

      if (responseDelay > 0) {
        await new Promise((r) => setTimeout(r, responseDelay))
      }

      if (callCount <= failUntilAttempt) {
        return Response.json(
          { error: 'Internal Server Error', attempt: callCount },
          { status: 500 },
        )
      }

      return Response.json({
        id: 1,
        name: 'Order #' + callCount,
        status: 'success',
      })
    },
  })

  return {
    get baseUrl() {
      return `http://localhost:${server.port}`
    },
    get callCount() {
      return callCount
    },
    reset() {
      callCount = 0
    },
    shutdown() {
      server.stop()
    },
  }
}

export type FakeService = ReturnType<typeof createFakeService>
