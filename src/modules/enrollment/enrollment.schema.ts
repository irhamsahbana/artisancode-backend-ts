import Joi from 'joi'

const validBillingTypes = ['one_time', 'monthly', 'quarterly', 'annually']

export const createEnrollmentSchema = Joi.object({
  branch_id: Joi.string().uuid().required(),
  student_id: Joi.string().uuid().required(),
  program_id: Joi.string().uuid().required(),
  enrollment_date: Joi.date().optional(),
  status: Joi.string().optional().valid('active', 'inactive'),
  billing_type: Joi.string()
    .optional()
    .valid(...validBillingTypes),
  billed_at: Joi.number().integer().min(0).optional(),
  next_payment_date: Joi.date().optional().allow(null),
})

export const updateEnrollmentSchema = Joi.object({
  branch_id: Joi.string().uuid().optional(),
  student_id: Joi.string().uuid().optional(),
  program_id: Joi.string().uuid().optional(),
  enrollment_date: Joi.date().optional(),
  status: Joi.string().optional().valid('active', 'inactive'),
  billing_type: Joi.string()
    .optional()
    .valid(...validBillingTypes),
  billed_at: Joi.number().integer().min(0).optional(),
  next_payment_date: Joi.date().optional().allow(null),
})

export const getEnrollmentListSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  branch_id: Joi.string().uuid().optional(),
  student_id: Joi.string().uuid().optional(),
  program_id: Joi.string().uuid().optional(),
})
