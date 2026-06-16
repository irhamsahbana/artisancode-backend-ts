import { httpClient } from './http-client'

import type { RequestOptions } from './types'

type GetOptions = Omit<RequestOptions, 'method' | 'body'>
type MutateOptions = Omit<RequestOptions, 'method'>

export function httpGet<T = unknown>(
  baseUrl: string,
  path: string,
  options?: GetOptions,
) {
  return httpClient<T>(baseUrl, path, { ...options, method: 'GET' })
}

export function httpPost<T = unknown>(
  baseUrl: string,
  path: string,
  body?: unknown,
  options?: MutateOptions,
) {
  return httpClient<T>(baseUrl, path, { ...options, method: 'POST', body })
}

export function httpPut<T = unknown>(
  baseUrl: string,
  path: string,
  body?: unknown,
  options?: MutateOptions,
) {
  return httpClient<T>(baseUrl, path, { ...options, method: 'PUT', body })
}

export function httpPatch<T = unknown>(
  baseUrl: string,
  path: string,
  body?: unknown,
  options?: MutateOptions,
) {
  return httpClient<T>(baseUrl, path, { ...options, method: 'PATCH', body })
}

export function httpDelete<T = unknown>(
  baseUrl: string,
  path: string,
  options?: GetOptions,
) {
  return httpClient<T>(baseUrl, path, { ...options, method: 'DELETE' })
}
