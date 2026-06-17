import { describe, it, expect } from 'bun:test'

import { ErrorCode, ValidationError } from '../packages/types'
import { responseSuccess, responseError } from '../rest_response'

describe('responseSuccess', () => {
  it('returns success response with default message', () => {
    const result = responseSuccess({ id: 1, name: 'Test' })

    expect(result.success).toBe(true)
    expect(result.message).toBe('your request has been processed successfully')
    expect(result.errors).toBeNull()
    expect(result.data).toEqual({ id: 1, name: 'Test' })
  })

  it('returns success response with custom message', () => {
    const result = responseSuccess(null, 'Custom message')

    expect(result.success).toBe(true)
    expect(result.message).toBe('Custom message')
  })

  it('converts camelCase keys to snake_case in data', () => {
    const result = responseSuccess({ firstName: 'John', lastName: 'Doe' })

    expect(result.data).toEqual({ first_name: 'John', last_name: 'Doe' })
  })
})

describe('responseError', () => {
  it('returns error response with default message', () => {
    const result = responseError()

    expect(result.success).toBe(false)
    expect(result.message).toBe('your request has failed')
    expect(result.errors).toBeNull()
    expect(result.data).toBeNull()
  })

  it('returns error response with ValidationError[]', () => {
    const errors: ValidationError[] = [
      { field: 'email', message: 'Invalid email' },
      { field: 'password', message: 'Too short' },
    ]

    const result = responseError('Validation failed', errors, ErrorCode.VALIDATION_ERROR)

    expect(result.success).toBe(false)
    expect(result.message).toBe('Validation failed')
    expect(result.error_code).toBe('VALIDATION_ERROR')
    expect(result.errors).toEqual(errors)
    expect(result.data).toBeNull()
  })

  it('returns error response with undefined errors as null', () => {
    const result = responseError('Not found', undefined, ErrorCode.NOT_FOUND)

    expect(result.errors).toBeNull()
  })
})
