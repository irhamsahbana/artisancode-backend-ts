import { execSync } from 'node:child_process'

import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from '@/db/schema'

/**
 * Start a PostgreSQL container, push the schema via drizzle-kit CLI,
 * and return the drizzle instance + container reference for cleanup.
 */
export async function createTestDb(): Promise<{
  db: ReturnType<typeof drizzle>
  container: StartedPostgreSqlContainer
}> {
  const container = await new PostgreSqlContainer('postgres:18-alpine')
    .withDatabase('test_db')
    .withUsername('test')
    .withPassword('test')
    .start()

  const connectionString = container.getConnectionUri()
  const client = postgres(connectionString)
  const testDb = drizzle(client, { schema })

  // Push schema to the test database via drizzle-kit CLI
  execSync(
    `DATABASE_URL="${connectionString}" npx drizzle-kit push --force`,
    { stdio: 'inherit', cwd: process.cwd() },
  )

  return { db: testDb, container }
}

/**
 * Clean up: disconnect DB and stop container.
 */
export async function cleanupTestDb(
  container: StartedPostgreSqlContainer,
  db: ReturnType<typeof drizzle>,
): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).$client.end()
  } catch {
    // ignore
  }
  await container.stop()
}
