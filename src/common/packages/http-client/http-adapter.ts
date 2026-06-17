import { httpGet, httpPost, httpPut, httpPatch, httpDelete } from './http'

import type { IHttpClient, GetOptions, MutateOptions } from './types'

export class HttpAdapter implements IHttpClient {
  get<T = unknown>(baseUrl: string, path: string, options?: GetOptions) {
    return httpGet<T>(baseUrl, path, options)
  }

  post<T = unknown>(baseUrl: string, path: string, body?: unknown, options?: MutateOptions) {
    return httpPost<T>(baseUrl, path, body, options)
  }

  put<T = unknown>(baseUrl: string, path: string, body?: unknown, options?: MutateOptions) {
    return httpPut<T>(baseUrl, path, body, options)
  }

  patch<T = unknown>(baseUrl: string, path: string, body?: unknown, options?: MutateOptions) {
    return httpPatch<T>(baseUrl, path, body, options)
  }

  delete<T = unknown>(baseUrl: string, path: string, options?: GetOptions) {
    return httpDelete<T>(baseUrl, path, options)
  }
}
