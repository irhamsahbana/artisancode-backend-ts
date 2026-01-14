import Joi from 'joi'

export const createEnrollmentSchema = Joi.object({
  branch_id: Joi.string().uuid().required(),
  student_id: Joi.string().uuid().required(),
  program_id: Joi.string().uuid().required(),
  pricing_id: Joi.string().uuid().required(),
  status: Joi.string().optional().valid('active', 'inactive'),
})

export const updateEnrollmentSchema = Joi.object({
  branch_id: Joi.string().uuid().optional(),
  student_id: Joi.string().uuid().optional(),
  program_id: Joi.string().uuid().optional(),
  pricing_id: Joi.string().uuid().optional(),
  status: Joi.string().optional().valid('active', 'inactive'),
})

export const getEnrollmentListSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  branch_id: Joi.string().uuid().optional(),
  student_id: Joi.string().uuid().optional(),
  program_id: Joi.string().uuid().optional(),
  pricing_id: Joi.string().uuid().optional(),
})
