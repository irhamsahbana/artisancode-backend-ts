import { getSdk, setSdk } from './sdk-state'

export const shutdownTelemetry = async () => {
  const sdk = getSdk()
  if (!sdk) return
  setSdk(null)
  await sdk.shutdown()
}
