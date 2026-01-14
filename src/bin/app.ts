import RESTServer from '@/bin/rest_server'
import gracefulShutdown from '@/common/graceful_shutdown'

class App {
  rest = new RESTServer()

  constructor() {
    this.rest.listen()
    process.on('SIGTERM', () => gracefulShutdown(this.rest.server))
    process.on('SIGINT', () => gracefulShutdown(this.rest.server))
    process.once('SIGUSR2', () => gracefulShutdown(this.rest.server))
  }
}

export default App
