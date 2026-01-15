import http from 'http'

import prisma from '@/common/prisma'
import logger from '@/config/logger'

const shutdown = (server: http.Server) => {
  logger.info('Received kill signal, shutting down gracefully ...')

  server.close(async () => {
    logger.info('HTTP server closed')
    // Here you will close other connections such as Database
    logger.info('Disconnecting from Prisma ...')
    await prisma.$disconnect()
    logger.info('Prisma disconnected')
    process.exit(0)
  })

  logger.info('Waiting for connections to close ...')

  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down')
    process.exit(1)
  }, 30 * 1000)
}

export default shutdown
