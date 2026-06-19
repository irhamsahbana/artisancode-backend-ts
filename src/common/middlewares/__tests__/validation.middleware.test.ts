import { describe, it, expect } from 'bun:test'
import { Hono } from 'hono'
import { z } from 'zod'

import { validate, validateQuery } from '../validation.middleware'

const loginSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const querySchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a number'),
  limit: z.string().optional(),
})

function createTestApp() {
  const app = new Hono()
  app.post('/login', validate(loginSchema), (c) => {
    const body = c.get('body')
    return c.json({ success: true, data: body })
  })
  app.get('/search', validateQuery(querySchema), (c) => {
    const body = c.get('body')
    return c.json({ success: true, data: body._query })
  })
  return app
}

describe('Validation Middleware', () => {
  describe('validate (body)', () => {
    it('returns 400 with ValidationError[] for invalid body', async () => {
      const app = createTestApp()
      const res = await app.request('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'not-an-email', password: '123' }),
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.success).toBe(false)
      expect(body.code).toBe('VALIDATION_ERROR')
      expect(body.message).toBe('Validation failed')
      expect(Array.isArray(body.errors)).toBe(true)
      expect(body.errors.length).toBe(2)

      // Check error structure
      body.errors.forEach((err: { field: string; message: string }) => {
        expect(typeof err.field).toBe('string')
        expect(typeof err.message).toBe('string')
      })

      // Find specific errors
      const emailError = body.errors.find((e: { field: string }) => e.field === 'email')
      const passwordError = body.errors.find((e: { field: string }) => e.field === 'password')
      expect(emailError?.message).toBe('Invalid email format')
      expect(passwordError?.message).toBe('Password must be at least 8 characters')
    })

    it('returns 400 for missing required fields', async () => {
      const app = createTestApp()
      const res = await app.request('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.errors.length).toBe(2)
    })

    it('returns 200 for valid body', async () => {
      const app = createTestApp()
      const res = await app.request('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: '12345678' }),
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
    })

    it('handles nested field errors with dot notation', async () => {
      const nestedSchema = z.object({
        user: z.object({
          name: z.string().min(1, 'Name is required'),
          email: z.string().email(),
        }),
      })

      const app = new Hono()
      app.post('/nested', validate(nestedSchema), (c) => {
        return c.json({ success: true })
      })

      const res = await app.request('/nested', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: { name: '', email: 'invalid' } }),
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      const nameError = body.errors.find((e: { field: string }) => e.field === 'user.name')
      expect(nameError?.message).toBe('Name is required')
    })
  })

  describe('validateQuery', () => {
    it('returns 400 with ValidationError[] for invalid query', async () => {
      const app = createTestApp()
      const res = await app.request('/search?page=abc&limit=10')

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.success).toBe(false)
      expect(body.errors.length).toBe(1)
      expect(body.errors[0].field).toBe('page')
      expect(body.errors[0].message).toBe('Page must be a number')
    })

    it('returns 200 for valid query', async () => {
      const app = createTestApp()
      const res = await app.request('/search?page=1&limit=10')

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
    })
  })
})
