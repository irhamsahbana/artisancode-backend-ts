import type pino from 'pino'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LogFn = (objOrMsg: string | Record<string, unknown> | Error, msgOrUndefined?: any) => void

/**
 * Winston-compatible wrapper for Pino.
 * Supports: logger.info('msg', { data }) and logger.info({ data }, 'msg')
 */
export const wrap = (fn: pino.LogFn, logger: pino.Logger): LogFn => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (objOrMsg: string | Record<string, unknown> | Error, msgOrUndefined?: any) => {
    if (typeof objOrMsg === 'string' && typeof msgOrUndefined === 'object' && msgOrUndefined !== null) {
      fn.call(logger, msgOrUndefined, objOrMsg)
    } else if (typeof objOrMsg === 'string' && msgOrUndefined === undefined) {
      fn.call(logger, objOrMsg)
    } else if (typeof objOrMsg === 'object' && objOrMsg !== null && typeof msgOrUndefined === 'string') {
      fn.call(logger, objOrMsg, msgOrUndefined)
    } else {
      fn.call(logger, objOrMsg as string)
    }
  }
}
