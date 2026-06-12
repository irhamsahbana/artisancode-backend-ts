/**
 * Transactor — provider-agnostic transaction boundary.
 *
 * Implementations wrap a callback in a database transaction:
 *   - If `fn` returns normally → commit
 *   - If `fn` throws → rollback
 *   - Nested calls reuse the outer transaction (no new tx created)
 */
export interface ITransactor {
  withinTransaction<T>(fn: () => Promise<T>): Promise<T>
}
