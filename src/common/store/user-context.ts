import { AsyncLocalStorage } from 'node:async_hooks'

import type { JwtPayload } from '@/common/packages/types'

const userStorage = new AsyncLocalStorage<JwtPayload>()

/**
 * Returns the current user context from the async storage.
 * Available anywhere in the request lifecycle after auth middleware runs.
 */
export function getUserContext(): JwtPayload | undefined {
  return userStorage.getStore()
}

/**
 * Runs a callback within a user context scope.
 * Used by auth middleware to propagate user through async calls.
 */
export function runWithUserContext<T>(user: JwtPayload, fn: () => Promise<T>): Promise<T> {
  return userStorage.run(user, fn)
}
