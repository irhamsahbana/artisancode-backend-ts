export interface RestResponse {
  errors?: unknown | null
  success: boolean
  message: string
  data?: unknown | null
}