import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'

import { responseError } from '@/common/rest_response'

const formatJoiError = (error: Joi.ValidationError) => {
  const errors: Record<string, string[]> = {}
  error.details.forEach((detail) => {
    const key = detail.path.join('.')
    if (!errors[key]) {
      errors[key] = []
    }
    errors[key].push(detail.message)
  })
  return errors
}

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })

    if (error) {
      return res.status(400).json(responseError('VALIDATION_ERROR', formatJoiError(error)))
    }

    req.body = value
    next()
  }
}

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    })

    if (error) {
      return res.status(400).json(responseError('VALIDATION_ERROR', formatJoiError(error)))
    }

    try {
      req.query = value
    } catch {
      Object.defineProperty(req, 'query', {
        value,
        writable: true,
        enumerable: true,
        configurable: true,
      })
    }
    next()
  }
}
