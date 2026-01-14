import Joi from 'joi'

const validStatuses = ['active', 'inactive', 'under_construction', 'temporarily_closed', 'planning']

export const createBranchSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  city: Joi.string().required().min(2).max(100),
  capacity: Joi.number().optional().integer().min(1),
  description: Joi.string().optional().allow('').max(500),
  address: Joi.string().optional().allow('').max(255),
  phone: Joi.string().optional().allow('').max(20),
  email: Joi.string().optional().allow('').email(),
  head_coach: Joi.string().optional().allow('').max(100),
  status: Joi.string()
    .optional()
    .valid(...validStatuses),
})

export const updateBranchSchema = Joi.object({
  name: Joi.string().optional().min(3).max(100),
  city: Joi.string().optional().min(2).max(100),
  capacity: Joi.number().optional().integer().min(1),
  description: Joi.string().optional().allow('').max(500),
  address: Joi.string().optional().allow('').max(255),
  phone: Joi.string().optional().allow('').max(20),
  email: Joi.string().optional().allow('').email(),
  head_coach: Joi.string().optional().allow('').max(100),
  status: Joi.string()
    .optional()
    .valid(...validStatuses),
})

export const getBranchListSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  q: Joi.string().allow('').optional(),
  status: Joi.string()
    .optional()
    .valid(...validStatuses),
})
