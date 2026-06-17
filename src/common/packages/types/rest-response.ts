export interface ValidationError {
  field: string
  message: string
}

export interface RestResponse {
  success: boolean
  message: string
  error_code?: string | null
  errors?: ValidationError[] | null
  data?: unknown | null
}