import { describe, it, expect } from 'bun:test'

import { AppError } from '../app-error'
import { ErrorCode } from '../error-codes'
import { ValidationError } from '../rest-response'

describe('AppError', () => {
  it('creates error with code and message', () => {
    const error = new AppError(ErrorCode.NOT_FOUND, 'User not found')

    expect(error.code).toBe('NOT_FOUND')
    expect(error.message).toBe('User not found')
    expect(error.name).toBe('AppError')
    expect(error.httpCode).toBeUndefined()
    expect(error.errors).toBeUndefined()
    expect(error.data).toBeUndefined()
  })

  it('creates error with ValidationError[]', () => {
    const errors: ValidationError[] = [
      { field: 'email', message: 'Invalid email' },
    ]

    const error = new AppError(ErrorCode.VALIDATION_ERROR, 'Validation failed', { errors })

    expect(error.errors).toEqual(errors)
  })

  it('creates error with explicit httpCode', () => {
    const error = new AppError(ErrorCode.INTERNAL_ERROR, 'Oops', { httpCode: 500 })

    expect(error.httpCode).toBe(500)
    expect(error.toHttpStatus()).toBe(500)
  })

  it('derives HTTP status from error code', () => {
    const notFound = new AppError(ErrorCode.NOT_FOUND, 'Not found')
    expect(notFound.toHttpStatus()).toBe(404)

    const unauthorized = new AppError(ErrorCode.UNAUTHORIZED, 'Unauthorized')
    expect(unauthorized.toHttpStatus()).toBe(401)

    const conflict = new AppError(ErrorCode.CONFLICT, 'Conflict')
    expect(conflict.toHttpStatus()).toBe(409)
  })

  it('getHttpResponse returns correct RestResponse shape', () => {
    const errors: ValidationError[] = [{ field: 'email', message: 'Invalid' }]
    const error = new AppError(ErrorCode.VALIDATION_ERROR, 'Validation failed', { errors })

    const response = error.getHttpResponse()

    expect(response.success).toBe(false)
    expect(response.message).toBe('Validation failed')
    expect(response.code).toBe('VALIDATION_ERROR')
    expect(response.reason).toBe('BAD_REQUEST')
    expect(response.errors).toEqual(errors)
    expect(response.data).toBeNull()
  })

  it('getErrorResponse returns logging shape', () => {
    const error = new AppError(ErrorCode.NOT_FOUND, 'Not found', { data: { id: 1 } })

    const response = error.getErrorResponse()

    expect(response.code).toBe('NOT_FOUND')
    expect(response.message).toBe('Not found')
    expect(response.reason).toBe('NOT_FOUND')
    expect(response.data).toEqual({ id: 1 })
  })

  it('captures stack trace', () => {
    const error = new AppError(ErrorCode.INTERNAL_ERROR, 'Error')

    expect(error.stack).toBeDefined()
    expect(error.stack).toContain('AppError')
  })
})
