import Joi from 'joi'

import { TeacherStatuses } from '@/entities/teacher.entity'

export const createTeacherSchema = Joi.object({
  branch_id: Joi.string().uuid().optional().allow(null),
  status: Joi.string()
    .valid(...TeacherStatuses)
    .optional(),
  name: Joi.string().required().min(2).max(100),
  email: Joi.string().email().required(),
  phone: Joi.string().optional().allow('').max(20),
  address: Joi.string().optional().allow('').max(255),
  birth_date: Joi.string().optional().allow(''),
  biography: Joi.string().optional().allow(''),
  specialty: Joi.string().optional().allow('').max(100),
})

export const updateTeacherSchema = Joi.object({
  branch_id: Joi.string().uuid().optional().allow(null),
  status: Joi.string()
    .valid(...TeacherStatuses)
    .optional(),
  name: Joi.string().optional().min(2).max(100),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional().allow('').max(20),
  address: Joi.string().optional().allow('').max(255),
  birth_date: Joi.string().optional().allow(''),
  biography: Joi.string().optional().allow(''),
  specialty: Joi.string().optional().allow('').max(100),
})

export const getTeacherListSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  q: Joi.string().allow('').optional(),
  branch_id: Joi.string().uuid().optional(),
})
