import { startTelemetry } from '@/telemetry'

startTelemetry()

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { default: App } = require('./bin/app')
new App()
