import { execSync } from 'node:child_process'

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from '@/db/schema'

import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql'

/**
 * Start a PostgreSQL container, push the schema via drizzle-kit CLI,
 * and return the drizzle instance + container reference for cleanup.
 *
 * Uses node subprocess for Testcontainers (bun has compatibility issues with it).
 */
export async function createTestDb(): Promise<{
  db: ReturnType<typeof drizzle>
  container: StartedPostgreSqlContainer
}> {
  // Use node to run Testcontainers (bun has compatibility issues)
  const uri = execSync(
    `node -e "
      const { PostgreSqlContainer } = require('@testcontainers/postgresql');
      (async () => {
        const c = await new PostgreSqlContainer('postgres:18-alpine')
          .withDatabase('test_db').withUsername('test').withPassword('test').start();
        process.stdout.write(c.getConnectionUri());
      })().catch(e => { process.stderr.write(e.message); process.exit(1); });
    "`,
    { encoding: 'utf-8', timeout: 30_000 },
  ).trim()

  const client = postgres(uri)
  const testDb = drizzle(client, { schema })

  // Push schema via node to avoid bun compatibility issues
  execSync(
    `node -e "require('child_process').execSync('DATABASE_URL=\\"${uri}\\" npx drizzle-kit push --force', { cwd: '${process.cwd()}', stdio: 'pipe' })"`,
    { encoding: 'utf-8', timeout: 30_000 },
  )

  // Wrapper that stops the container by finding it via docker
  const container: StartedPostgreSqlContainer = {
    getConnectionUri: () => uri,
    getId: () => '',
    stop: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      try { await (testDb as any).$client.end() } catch { /* ignore */ }
      try {
        execSync('docker stop $(docker ps -q --filter "ancestor=postgres:18-alpine" | grep . | awk "NR==1")', {
          encoding: 'utf-8',
          timeout: 10_000,
        })
      } catch { /* ignore */ }
    },
  } as unknown as StartedPostgreSqlContainer

  return { db: testDb, container }
}

/**
 * Clean up: disconnect DB and stop container.
 */
export async function cleanupTestDb(
  container: StartedPostgreSqlContainer,
  db: ReturnType<typeof drizzle>,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  try { await (db as any).$client.end() } catch { /* ignore */ }
  try { await container.stop() } catch { /* ignore */ }
}
