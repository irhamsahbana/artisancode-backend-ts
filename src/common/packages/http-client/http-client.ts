import { AppError, ErrorCode } from '@/common/packages/types'
import logger from '@/config/logger'

import { buildUrl } from './build-url'
import { injectTraceHeaders } from './inject-trace-headers'
import { isJsonBody } from './is-json-body'

import type { RequestOptions, HttpResponse } from './types'

const HTTP_STATUS_TO_CODE: Record<number, ErrorCode> = {
  400: ErrorCode.HTTP_BAD_REQUEST,
  401: ErrorCode.HTTP_UNAUTHORIZED,
  403: ErrorCode.HTTP_FORBIDDEN,
  404: ErrorCode.HTTP_NOT_FOUND,
  408: ErrorCode.HTTP_TIMEOUT,
  429: ErrorCode.HTTP_TOO_MANY_REQUESTS,
  502: ErrorCode.HTTP_BAD_GATEWAY,
  503: ErrorCode.HTTP_SERVICE_UNAVAILABLE,
}

function httpError(status: number, statusText: string, data?: unknown): AppError {
  const code = HTTP_STATUS_TO_CODE[status] ?? ErrorCode.HTTP_INTERNAL_ERROR
  return new AppError(code, `HTTP ${status}: ${statusText}`, { httpCode: status, data })
}

export async function httpClient<T = unknown>(
  baseUrl: string,
  path: string,
  options: RequestOptions = {},
): Promise<HttpResponse<T>> {
  const { method = 'GET', headers = {}, body, query, timeout = 30_000 } = options

  const url = buildUrl(baseUrl, path, query)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const isJson = isJsonBody(body)
    const finalHeaders = injectTraceHeaders(headers)

    const response = await fetch(url, {
      method,
      headers: {
        ...(isJson ? { 'Content-Type': 'application/json' } : {}),
        ...finalHeaders,
      },
      body: isJson ? JSON.stringify(body) : (body as BodyInit | undefined),
      signal: controller.signal,
    })

    const contentType = response.headers.get('content-type') ?? ''
    let data: T

    if (contentType.includes('application/json')) {
      data = (await response.json()) as T
    } else {
      data = (await response.text()) as unknown as T
    }

    if (!response.ok) {
      throw httpError(response.status, response.statusText, data)
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data,
    }
  } catch (error) {
    if (error instanceof AppError) {
      logger.error(`[HTTP] ${method} ${url} failed: ${error.httpCode} ${error.message}`)
      throw error
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      logger.error(`[HTTP] ${method} ${url} timed out after ${timeout}ms`)
      throw new AppError(ErrorCode.HTTP_TIMEOUT, `Request timed out after ${timeout}ms`, { httpCode: 408 })
    }

    if (error instanceof TypeError) {
      logger.error(`[HTTP] ${method} ${url} network error: ${error.message}`)
      throw new AppError(ErrorCode.HTTP_BAD_GATEWAY, `Network error: ${error.message}`, { httpCode: 502 })
    }

    logger.error(`[HTTP] ${method} ${url} error:`, error)
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}
