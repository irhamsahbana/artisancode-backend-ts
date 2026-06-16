import { ExponentialBackoff, retry, handleAll, type IPolicy, type IDefaultPolicyContext } from 'cockatiel'

import type { RetryOptions } from './types'

export function createRetryPolicy(
  options: RetryOptions = {},
): IPolicy<IDefaultPolicyContext, unknown> {
  const { maxAttempts = 3 } = options

  return retry(handleAll, {
    maxAttempts,
    backoff: new ExponentialBackoff(),
  })
}
