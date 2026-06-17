import { ExponentialBackoff, retry, handleWhen, isTaskCancelledError, type IPolicy, type IDefaultPolicyContext } from 'cockatiel'

import { AppError } from '@/common/packages/types'

import type { RetryOptions } from './types'

function isRetryable(error: unknown): boolean {
  // Network errors (TypeError from fetch)
  if (error instanceof TypeError) {
    return true
  }

  // Timeout errors
  if (isTaskCancelledError(error)) {
    return true
  }

  // AppError with 5xx status
  if (error instanceof AppError && error.httpCode && error.httpCode >= 500) {
    return true
  }

  return false
}

export function createRetryPolicy(
  options: RetryOptions = {},
): IPolicy<IDefaultPolicyContext, unknown> {
  const { maxAttempts = 3 } = options

  return retry(handleWhen(isRetryable), {
    maxAttempts,
    backoff: new ExponentialBackoff(),
  })
}
