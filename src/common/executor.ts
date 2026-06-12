import { AsyncLocalStorage } from 'node:async_hooks'

import { db } from '@/common/db'
import type { ITransactor } from '@/contracts/integration'

// ---------------------------------------------------------------------------
// Executor type — the subset of Drizzle's API used by all repositories.
// Both the global `db` and a transaction client satisfy this interface.
// ---------------------------------------------------------------------------
export type Executor = typeof db

// ---------------------------------------------------------------------------
// AsyncLocalStorage — propagates the current executor through async calls.
// When inside withinTransaction(), this holds the tx client.
// When outside, it is empty and getExecutor() falls back to the global db.
// ---------------------------------------------------------------------------
const executorStorage = new AsyncLocalStorage<Executor>()

/**
 * Returns the current database executor.
 *
 * - Inside `transactor.withinTransaction()` → returns the transaction client
 * - Outside any transaction → returns the global `db` instance
 *
 * Repositories should call this instead of importing `db` directly.
 */
export function getExecutor(): Executor {
  return executorStorage.getStore() ?? db
}

// ---------------------------------------------------------------------------
// Transactor — wraps Drizzle's `db.transaction()` with AsyncLocalStorage
// propagation, following the same contract as artisancode's Transactor port.
// ---------------------------------------------------------------------------
export const transactor: ITransactor = {
  async withinTransaction<T>(fn: () => Promise<T>): Promise<T> {
    // Nested call — reuse the outer transaction (Drizzle uses savepoints internally)
    if (executorStorage.getStore()) {
      return fn()
    }

    return db.transaction(async (tx) => {
      // Store the tx client so that getExecutor() returns it for the
      // duration of this callback (and any nested async calls).
      return executorStorage.run(tx as unknown as Executor, fn)
    })
  },
}
