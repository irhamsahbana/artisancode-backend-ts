import { context, propagation } from '@opentelemetry/api'
import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test'

import { injectTraceHeaders } from '../inject-trace-headers'

// Store original implementations
const originalContextActive = context.active
const originalPropagationInject = propagation.inject

describe('injectTraceHeaders', () => {
  beforeEach(() => {
    // Mock propagation.inject to simulate trace header injection
    propagation.inject = mock((_ctx: unknown, carrier: Record<string, string>) => {
      carrier['traceparent'] = '00-abc123-def456-01'
      carrier['tracestate'] = 'vendor=value'
    }) as typeof propagation.inject

    // Mock context.active
    context.active = mock(() => ({})) as unknown as typeof context.active
  })

  afterEach(() => {
    // Restore originals
    context.active = originalContextActive
    propagation.inject = originalPropagationInject
  })

  it('injects trace headers into empty headers object', () => {
    const result = injectTraceHeaders({})

    expect(result).toHaveProperty('traceparent')
    expect(result).toHaveProperty('tracestate')
  })

  it('preserves existing headers', () => {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer token123',
    }

    const result = injectTraceHeaders(headers)

    expect(result['Content-Type']).toBe('application/json')
    expect(result['Authorization']).toBe('Bearer token123')
    expect(result).toHaveProperty('traceparent')
  })

  it('user headers override trace headers', () => {
    const headers = {
      traceparent: 'user-custom-value',
    }

    const result = injectTraceHeaders(headers)

    // User headers should take precedence
    expect(result['traceparent']).toBe('user-custom-value')
  })

  it('calls propagation.inject with active context', () => {
    const mockContext = { spanContext: () => ({}) }
    context.active = mock(() => mockContext) as unknown as typeof context.active

    injectTraceHeaders({})

    expect(context.active).toHaveBeenCalled()
    expect(propagation.inject).toHaveBeenCalledWith(mockContext, expect.any(Object))
  })

  it('creates new carrier object for each call', () => {
    const result1 = injectTraceHeaders({})
    const result2 = injectTraceHeaders({})

    // Should be different object references
    expect(result1).not.toBe(result2)
  })

  it('handles complex header merging', () => {
    const headers = {
      'X-Custom-Header': 'value1',
      'X-Another-Header': 'value2',
      tracestate: 'user-overridden',
    }

    const result = injectTraceHeaders(headers)

    expect(result['X-Custom-Header']).toBe('value1')
    expect(result['X-Another-Header']).toBe('value2')
    expect(result['tracestate']).toBe('user-overridden')
    expect(result).toHaveProperty('traceparent')
  })
})
