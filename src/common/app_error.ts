export class AppError extends Error {
  public readonly statusCode: number
  public readonly errors?: unknown

  constructor(statusCode: number, message: string, errors?: unknown) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}
