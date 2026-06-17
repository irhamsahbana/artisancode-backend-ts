export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestOptions {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: unknown
  query?: Record<string, string | number | boolean | undefined | null>
}

export interface HttpResponse<T = unknown> {
  status: number
  statusText: string
  headers: Headers
  data: T
}

export type GetOptions = Omit<RequestOptions, 'method' | 'body'>
export type MutateOptions = Omit<RequestOptions, 'method'>

export interface IHttpClient {
  get<T = unknown>(baseUrl: string, path: string, options?: GetOptions): Promise<HttpResponse<T>>
  post<T = unknown>(baseUrl: string, path: string, body?: unknown, options?: MutateOptions): Promise<HttpResponse<T>>
  put<T = unknown>(baseUrl: string, path: string, body?: unknown, options?: MutateOptions): Promise<HttpResponse<T>>
  patch<T = unknown>(baseUrl: string, path: string, body?: unknown, options?: MutateOptions): Promise<HttpResponse<T>>
  delete<T = unknown>(baseUrl: string, path: string, options?: GetOptions): Promise<HttpResponse<T>>
}
