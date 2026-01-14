const toSnakeCase = (obj: unknown): unknown => {
  if (Array.isArray(obj)) {
    return obj.map((v) => toSnakeCase(v))
  } else if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => {
        const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
        ;(result as Record<string, unknown>)[snakeKey] = toSnakeCase(
          (obj as Record<string, unknown>)[key],
        )
        return result
      },
      {} as Record<string, unknown>,
    )
  }
  return obj
}

export const responseSuccess = (data: unknown, message?: string) => {
  if (!message) {
    message = 'your request has been processed successfully'
  }

  return {
    errors: null,
    success: true,
    message: message,
    data: toSnakeCase(data),
  }
}

export const responseError = (message?: string, errors?: unknown) => {
  if (!message) {
    message = 'your request has failed'
  }

  return {
    errors: errors,
    success: false,
    message: message,
    data: null,
  }
}
