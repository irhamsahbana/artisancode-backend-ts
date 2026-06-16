import path from 'path'

import winston from 'winston'

export const withSourceLocation = winston.format((info) => {
  const err = new Error()
  const stack = err.stack?.split('\n') || []
  // cari frame pertama yang bukan dari logger.ts atau node_modules
  for (const line of stack) {
    const match = line.match(/\s+at\s+(.+):(\d+):\d+/)
    if (match) {
      const filePath = match[1]
      const lineNo = match[2]
      // skip internal frames
      if (
        filePath.includes('logger.ts') ||
        filePath.includes('with-source-location.ts') ||
        filePath.includes('node_modules') ||
        filePath.includes('telemetry.ts')
      ) {
        continue
      }
      // ambil path relatif dari src/ terakhir (buang duplikat src/sobatbisnis/api/src/)
      const lastSrcIndex = filePath.lastIndexOf('src/')
      const relativePath = lastSrcIndex !== -1 ? filePath.slice(lastSrcIndex) : path.basename(filePath)
      ;(info as unknown as Record<string, unknown>).location = `${relativePath}:${lineNo}`
      break
    }
  }
  return info
})
