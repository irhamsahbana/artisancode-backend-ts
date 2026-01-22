import Joi from 'joi'

import { CategoryStatuses } from '@/entities/category.entity'

export const createCategorySchema = Joi.object({
  parent_id: Joi.string().uuid().optional().allow(null),
  group: Joi.string().optional().allow(''),
  name: Joi.string().required().min(2).max(100),
  status: Joi.string()
    .optional()
    .valid(...CategoryStatuses),
})

export const updateCategorySchema = Joi.object({
  parent_id: Joi.string().uuid().optional().allow(null),
  group: Joi.string().optional().allow(''),
  name: Joi.string().optional().min(2).max(100),
  status: Joi.string()
    .optional()
    .valid(...CategoryStatuses),
})

export const getCategoryListSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  q: Joi.string().allow('').optional(),
  group: Joi.string().allow('').optional(),
})
