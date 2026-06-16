export interface ResiliencePolicy {
  execute: <T>(fn: () => Promise<T>) => Promise<T>
}

export interface RetryOptions {
  maxAttempts?: number
}

export interface CircuitBreakerOptions {
  halfOpenAfter?: number
  threshold?: number
}
