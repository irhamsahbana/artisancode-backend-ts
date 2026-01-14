import Joi from 'joi'

export const createCompanySchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  status: Joi.string().valid('active', 'inactive').optional(),
})

export const updateCompanySchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  status: Joi.string().valid('active', 'inactive').optional(),
})

export const getCompanyListSchema = Joi.object({
  q: Joi.string().optional().allow(''),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  ids: Joi.string().optional(),
})
