import Joi from 'joi'

// Role Schemas
export const createRoleSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  description: Joi.string().allow('').optional(),
  permission_ids: Joi.array().items(Joi.string().uuid()).optional(),
})

export const updateRoleSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  description: Joi.string().allow('').optional(),
  permission_ids: Joi.array().items(Joi.string().uuid()).optional(),
})

export const getRoleListSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  q: Joi.string().allow('').optional(),
  ids: Joi.string().optional(),
})

// Permission Schemas
export const getPermissionListSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  q: Joi.string().allow('').optional(),
})
