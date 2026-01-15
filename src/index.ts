import { startTelemetry } from '@/telemetry'

type AppConstructor = typeof import('./bin/app').default

startTelemetry()
void import('./bin/app.js').then((mod) => {
  const App = mod.default as unknown as AppConstructor
  new App()
})
