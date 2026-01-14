import Joi from 'joi'

export const createUserSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  username: Joi.string().required().min(3).max(50),
  password: Joi.string().required().min(6).max(100),
  email: Joi.string().email().required(),
  phone: Joi.string().required().max(20),
  company_id: Joi.string().required().uuid(),
  role_id: Joi.string().required().uuid(),
  status: Joi.string().valid('active', 'inactive').optional(),
})

export const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
})

export const getUserListSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  q: Joi.string().allow('').optional(),
})
