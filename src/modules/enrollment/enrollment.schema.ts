import Joi from 'joi'

import { EnrollmentStatuses } from '@/entities/enrollment.entity'

const validBillingTypes = ['one_time', 'monthly', 'quarterly', 'annually']

export const createEnrollmentSchema = Joi.object({
  branch_id: Joi.string().uuid().required(),
  student_id: Joi.string().uuid().required(),
  program_id: Joi.string().uuid().required(),
  pricing_id: Joi.string().uuid().required(),
  currency: Joi.string().optional(),
  enrollment_date: Joi.date().optional(),
  status: Joi.string()
    .optional()
    .valid(...EnrollmentStatuses),
  billing_cycle: Joi.string()
    .optional()
    .valid(...validBillingTypes),
  next_payment_date: Joi.date().optional().allow(null),
})

export const updateEnrollmentSchema = Joi.object({
  branch_id: Joi.string().uuid().optional(),
  student_id: Joi.string().uuid().optional(),
  program_id: Joi.string().uuid().optional(),
  pricing_id: Joi.string().uuid().optional(),
  currency: Joi.string().optional(),
  enrollment_date: Joi.date().optional(),
  status: Joi.string()
    .optional()
    .valid(...EnrollmentStatuses),
  billing_cycle: Joi.string()
    .optional()
    .valid(...validBillingTypes),
  next_payment_date: Joi.date().optional().allow(null),
})

export const getEnrollmentListSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  branch_id: Joi.string().uuid().optional(),
  student_id: Joi.string().uuid().optional(),
  program_id: Joi.string().uuid().optional(),
})
