export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestOptions {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: unknown
  query?: Record<string, string | number | boolean | undefined | null>
  timeout?: number
}

export interface HttpResponse<T = unknown> {
  status: number
  statusText: string
  headers: Headers
  data: T
}
