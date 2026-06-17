export interface RestResponse {
  success: boolean
  message: string
  error_code?: string | null
  errors?: unknown | null
  data?: unknown | null
}