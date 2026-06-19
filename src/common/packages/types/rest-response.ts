export interface ValidationError {
  field: string
  message: string
}

export interface RestResponse {
  success: boolean
  message: string
  code?: string | null
  reason?: string | null
  errors?: ValidationError[] | null
  data?: unknown | null
}