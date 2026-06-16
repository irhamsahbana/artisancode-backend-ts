import { AppError, ErrorCode } from '@/common/packages/types'
import logger from '@/config/logger'

import { buildUrl } from './build-url'
import { HttpError } from './http-error'
import { injectTraceHeaders } from './inject-trace-headers'
import { isJsonBody } from './is-json-body'

import type { RequestOptions, HttpResponse } from './types'

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
      throw new HttpError(response.status, response.statusText, data)
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data,
    }
  } catch (error) {
    if (error instanceof HttpError) {
      logger.error(`[HTTP] ${method} ${url} failed: ${error.statusCode} ${error.message}`)
      throw error
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      logger.error(`[HTTP] ${method} ${url} timed out after ${timeout}ms`)
      throw new AppError(ErrorCode.REQUEST_TIMEOUT, `Request timed out after ${timeout}ms`, { statusCode: 408 })
    }

    logger.error(`[HTTP] ${method} ${url} error:`, error)
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}
