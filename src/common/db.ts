import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { env } from '@/config/env'
import * as schema from '@/db/schema'

// ---------------------------------------------------------------------------
// Connection pool configuration
// ---------------------------------------------------------------------------
const connectionConfig: postgres.Options<Record<string, postgres.PostgresType>> = {
  max: env.DATABASE.POOL.MAX,
  idle_timeout: env.DATABASE.POOL.IDLE_TIMEOUT_MS / 1000, // postgres.js uses seconds
  connect_timeout: env.DATABASE.POOL.CONNECTION_TIMEOUT_MS / 1000,
  keep_alive: 10,
  ssl: env.DATABASE.SSL.ENABLED
    ? { rejectUnauthorized: env.DATABASE.SSL.REJECT_UNAUTHORIZED }
    : false,
}

// ---------------------------------------------------------------------------
// Postgres.js client (handles connection pooling internally)
// ---------------------------------------------------------------------------
const client = postgres(env.DATABASE.URL ?? '', connectionConfig)

// ---------------------------------------------------------------------------
// Drizzle ORM instance with schema for type-safe relational queries
// ---------------------------------------------------------------------------
export let db = drizzle(client, { schema })

/**
 * Replace the global db singleton (used by integration tests to swap in a
 * Testcontainers-backed database).
 */
export const resetDb = (newDb: typeof db): void => {
  db = newDb
}

// Graceful shutdown helper
export const disconnect = async (): Promise<void> => {
  await client.end()
}

export default db
