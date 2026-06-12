import { Context, Next } from 'hono'
import { ZodError, ZodObject } from 'zod'

import { responseError } from '@/common/rest_response'
import { AppEnv } from '@/common/types'

const formatZodError = (error: ZodError) => {
  const errors: Record<string, string[]> = {}
  error.issues.forEach((issue) => {
    const key = issue.path.join('.')
    if (!errors[key]) {
      errors[key] = []
    }
    errors[key].push(issue.message)
  })
  return errors
}

export const validate = (schema: ZodObject) => {
  return async (c: Context<AppEnv>, next: Next) => {
    const body = await c.req.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      return c.json(responseError('VALIDATION_ERROR', formatZodError(result.error)), 400)
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
      return c.json(responseError('VALIDATION_ERROR', formatZodError(result.error)), 400)
    }

    // Store validated query in body variable for handler access
    c.set('body', { ...c.get('body'), _query: result.data })
    await next()
  }
}
