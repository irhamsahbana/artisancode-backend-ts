import { describe, it, expect } from 'bun:test'

import { ErrorCode } from '@/common/packages/types/error-codes'

import { buildUrl } from '../build-url'
import { HttpError } from '../http-error'
import { isJsonBody } from '../is-json-body'

// ── buildUrl ─────────────────────────────────────────────────────────────────

describe('buildUrl', () => {
  it('joins baseUrl and path', () => {
    const url = buildUrl('https://api.example.com', '/users')
    expect(url).toBe('https://api.example.com/users')
  })

  it('handles baseUrl without trailing slash', () => {
    const url = buildUrl('https://api.example.com', '/users')
    expect(url).toBe('https://api.example.com/users')
  })

  it('handles baseUrl with trailing slash', () => {
    const url = buildUrl('https://api.example.com/', '/users')
    expect(url).toBe('https://api.example.com/users')
  })

  it('handles path without leading slash', () => {
    const url = buildUrl('https://api.example.com', 'users')
    expect(url).toBe('https://api.example.com/users')
  })

  it('appends query parameters', () => {
    const url = buildUrl('https://api.example.com', '/search', {
      q: 'hello',
      page: 2,
    })
    expect(url).toContain('q=hello')
    expect(url).toContain('page=2')
  })

  it('skips null and undefined query params', () => {
    const url = buildUrl('https://api.example.com', '/search', {
      q: 'hello',
      missing: undefined,
      empty: null,
    })
    expect(url).toContain('q=hello')
    expect(url).not.toContain('missing')
    expect(url).not.toContain('empty')
  })

  it('converts number query params to string', () => {
    const url = buildUrl('https://api.example.com', '/api', { limit: 50 })
    expect(url).toContain('limit=50')
  })

  it('converts boolean query params to string', () => {
    const url = buildUrl('https://api.example.com', '/api', { active: true })
    expect(url).toContain('active=true')
  })
})

// ── isJsonBody ───────────────────────────────────────────────────────────────

describe('isJsonBody', () => {
  it('returns true for plain objects', () => {
    expect(isJsonBody({ name: 'test' })).toBe(true)
  })

  it('returns true for arrays', () => {
    expect(isJsonBody([1, 2, 3])).toBe(true)
  })

  it('returns false for null', () => {
    expect(isJsonBody(null)).toBe(false)
  })

  it('returns false for strings', () => {
    expect(isJsonBody('hello')).toBe(false)
  })

  it('returns false for numbers', () => {
    expect(isJsonBody(42)).toBe(false)
  })

  it('returns false for FormData', () => {
    const fd = new FormData()
    fd.append('key', 'value')
    expect(isJsonBody(fd)).toBe(false)
  })

  it('returns false for URLSearchParams', () => {
    expect(isJsonBody(new URLSearchParams({ q: 'test' }))).toBe(false)
  })

  it('returns false for Blob', () => {
    expect(isJsonBody(new Blob())).toBe(false)
  })
})

// ── HttpError ────────────────────────────────────────────────────────────────

describe('HttpError', () => {
  it('maps 400 to HTTP_BAD_REQUEST', () => {
    const err = new HttpError(400, 'Bad Request')
    expect(err.httpCode).toBe(400)
    expect(err.code).toBe(ErrorCode.HTTP_BAD_REQUEST)
    expect(err.name).toBe('HttpError')
  })

  it('maps 401 to HTTP_UNAUTHORIZED', () => {
    const err = new HttpError(401, 'Unauthorized')
    expect(err.code).toBe(ErrorCode.HTTP_UNAUTHORIZED)
  })

  it('maps 403 to HTTP_FORBIDDEN', () => {
    const err = new HttpError(403, 'Forbidden')
    expect(err.code).toBe(ErrorCode.HTTP_FORBIDDEN)
  })

  it('maps 404 to HTTP_NOT_FOUND', () => {
    const err = new HttpError(404, 'Not Found')
    expect(err.code).toBe(ErrorCode.HTTP_NOT_FOUND)
  })

  it('maps 500 to HTTP_INTERNAL_ERROR', () => {
    const err = new HttpError(500, 'Internal Server Error')
    expect(err.code).toBe(ErrorCode.HTTP_INTERNAL_ERROR)
  })

  it('uses fallback code for unmapped status codes', () => {
    const err = new HttpError(418, "I'm a teapot")
    expect(err.code).toBe(2518 as ErrorCode) // 2100 + 418
  })

  it('includes response data', () => {
    const err = new HttpError(400, 'Bad Request', { field: 'name is required' })
    expect(err.errors).toEqual({ field: 'name is required' })
  })

  it('stores statusText', () => {
    const err = new HttpError(502, 'Bad Gateway')
    expect(err.statusText).toBe('Bad Gateway')
  })
})
