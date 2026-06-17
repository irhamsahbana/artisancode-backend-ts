import { timeout as cockatielTimeout, TimeoutStrategy, type IPolicy, type IDefaultPolicyContext } from 'cockatiel'

import type { TimeoutOptions } from './types'

export function createTimeoutPolicy(
  options: TimeoutOptions = {},
): IPolicy<IDefaultPolicyContext, unknown> {
  const { duration = 30_000, strategy = TimeoutStrategy.Aggressive } = options

  return cockatielTimeout(duration, { strategy, abortOnReturn: false })
}
