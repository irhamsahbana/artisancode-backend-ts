
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

import { env } from '@/config/env'

const pool = new Pool({
  connectionString: env.DATABASE.URL,

  max: env.DATABASE.POOL.MAX,
  min: env.DATABASE.POOL.MIN,
  idleTimeoutMillis: env.DATABASE.POOL.IDLE_TIMEOUT_MS,
  connectionTimeoutMillis: env.DATABASE.POOL.CONNECTION_TIMEOUT_MS,

  keepAlive: true,

  ssl: env.DATABASE.SSL.ENABLED
    ? { rejectUnauthorized: env.DATABASE.SSL.REJECT_UNAUTHORIZED }
    : false,
})

const adapter = new PrismaPg(pool)

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    adapter,
    log:
      env.APP_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (env.APP_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma
