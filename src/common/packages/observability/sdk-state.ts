import type { NodeSDK } from '@opentelemetry/sdk-node'

// Shared mutable state between start and shutdown
let sdk: NodeSDK | null = null

export function getSdk(): NodeSDK | null {
  return sdk
}

export function setSdk(instance: NodeSDK | null): void {
  sdk = instance
}
