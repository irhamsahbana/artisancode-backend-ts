import { wrap, type IPolicy, type IDefaultPolicyContext } from 'cockatiel'

import type { ResiliencePolicy } from './types'

export function wrapPolicies(
  ...policies: IPolicy<IDefaultPolicyContext, unknown>[]
): ResiliencePolicy {
  const wrapped = wrap(...policies)

  return {
    execute: <T>(fn: () => Promise<T>) => wrapped.execute(fn) as Promise<T>,
  }
}
