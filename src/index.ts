import { startTelemetry } from '@/common/packages/observability'

await startTelemetry()

const { default: App } = await import('./bin/app')
new App()
