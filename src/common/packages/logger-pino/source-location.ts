import path from 'path'

export const addSourceLocation = (): { location?: string } => {
  const err = new Error()
  const stack = err.stack?.split('\n') || []
  for (const line of stack) {
    const match = line.match(/\s+at\s+(.+):(\d+):\d+/)
    if (match) {
      const filePath = match[1]
      const lineNo = match[2]
      if (
        filePath.includes('packages/logger-pino/') ||
        filePath.includes('node_modules') ||
        filePath.includes('telemetry.ts')
      ) {
        continue
      }
      const lastSrcIndex = filePath.lastIndexOf('src/')
      const relativePath = lastSrcIndex !== -1 ? filePath.slice(lastSrcIndex) : path.basename(filePath)
      return { location: `${relativePath}:${lineNo}` }
    }
  }
  return {}
}
