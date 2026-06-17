import { Context, Next } from 'hono'
import { ZodError, ZodObject } from 'zod'

import { AppEnv, ErrorCode, ValidationError } from '@/common/packages/types'
import { responseError } from '@/common/rest_response'

const formatZodError = (error: ZodError): ValidationError[] => {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || 'root',
    message: issue.message,
  }))
}

export const validate = (schema: ZodObject) => {
  return async (c: Context<AppEnv>, next: Next) => {
    const body = await c.req.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      return c.json(responseError('Validation failed', formatZodError(result.error), ErrorCode.VALIDATION_ERROR), 400)
    }

    c.set('body', result.data)
    await next()
  }
}

export const validateQuery = (schema: ZodObject) => {
  return async (c: Context<AppEnv>, next: Next) => {
    const query = c.req.query()
    const result = schema.safeParse(query)

    if (!result.success) {
      return c.json(responseError('Validation failed', formatZodError(result.error), ErrorCode.VALIDATION_ERROR), 400)
    }

    // Store validated query in body variable for handler access
    c.set('body', { ...c.get('body'), _query: result.data })
    await next()
  }
}
