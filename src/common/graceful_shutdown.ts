import { disconnect } from '@/common/db'
import logger from '@/config/logger'
import { shutdownTelemetry } from '@/telemetry'

const shutdown = (server: ReturnType<typeof Bun.serve>) => {
  logger.info('Received kill signal, shutting down gracefully ...')

  server.stop(true).then(async () => {
    logger.info('HTTP server closed')

    // Here you will close other connections such as Database
    logger.info('Disconnecting from database ...')
    await disconnect()
    logger.info('Database disconnected')

    logger.info('Shutting down telemetry ...')
    await shutdownTelemetry()
    logger.info('Telemetry shut down')

    process.exit(0)
  })

  logger.info('Waiting for connections to close ...')

  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down')
    process.exit(1)
  }, 30 * 1000)
}

export default shutdown
