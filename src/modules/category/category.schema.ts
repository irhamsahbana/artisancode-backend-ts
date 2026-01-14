import Joi from 'joi'

const validStatuses = ['active', 'inactive']

export const createCategorySchema = Joi.object({
  parent_id: Joi.string().uuid().optional().allow(null),
  group: Joi.string().optional().allow(''),
  name: Joi.string().required().min(2).max(100),
  status: Joi.string()
    .optional()
    .valid(...validStatuses),
})

export const updateCategorySchema = Joi.object({
  parent_id: Joi.string().uuid().optional().allow(null),
  group: Joi.string().optional().allow(''),
  name: Joi.string().optional().min(2).max(100),
  status: Joi.string()
    .optional()
    .valid(...validStatuses),
})

export const getCategoryListSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  q: Joi.string().allow('').optional(),
  group: Joi.string().allow('').optional(),
})
