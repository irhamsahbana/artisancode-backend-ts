import Joi from 'joi'

import { ProgramStatuses } from '@/entities/program.entity'

const programScheduleSchema = Joi.object({
  id: Joi.string().uuid().optional().allow(null),
  day: Joi.string()
    .optional()
    .allow('')
    .valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
  start_time: Joi.string()
    .optional()
    .allow('')
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/), // HH:mm
  end_time: Joi.string()
    .optional()
    .allow('')
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/), // HH:mm
})

const programPriceSchema = Joi.object({
  id: Joi.string().uuid().optional().allow(null),
  currency: Joi.string().required().length(3), // ISO 4217
  price: Joi.number().required().min(0), // Minor units
  started_at: Joi.date().optional(),
  ended_at: Joi.date().optional().allow(null),
})

const programPricingSchema = Joi.object({
  id: Joi.string().uuid().optional().allow(null),
  name: Joi.string().required(),
  description: Joi.string().optional().allow(''),
  prices: Joi.array().items(programPriceSchema).required().min(1),
})

export const createProgramSchema = Joi.object({
  branch_id: Joi.string().uuid().optional().allow(null),
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().optional().allow('').max(500),
  capacity: Joi.number().optional().min(0),
  status: Joi.string()
    .optional()
    .valid(...ProgramStatuses),
  schedules: Joi.array().items(programScheduleSchema).optional(),
  pricings: Joi.array().items(programPricingSchema).optional(),
  teachers: Joi.array().items(Joi.string().uuid()).optional(),
})

export const updateProgramSchema = Joi.object({
  branch_id: Joi.string().uuid().optional().allow(null),
  name: Joi.string().optional().min(2).max(100),
  description: Joi.string().optional().allow('').max(500),
  capacity: Joi.number().optional().min(0),
  status: Joi.string()
    .optional()
    .valid(...ProgramStatuses),
})

export const updateProgramAllSchema = Joi.object({
  branch_id: Joi.string().uuid().optional().allow(null),
  name: Joi.string().optional().min(2).max(100),
  description: Joi.string().optional().allow('').max(500),
  capacity: Joi.number().optional().min(0),
  status: Joi.string()
    .optional()
    .valid(...ProgramStatuses),
  schedules: Joi.array().items(programScheduleSchema).optional(),
  pricings: Joi.array().items(programPricingSchema).optional(),
  teachers: Joi.array().items(Joi.string().uuid()).optional(),
})

export const addScheduleSchema = programScheduleSchema

export const addPricingSchema = programPricingSchema

export const addPriceSchema = programPriceSchema

export const updatePriceSchema = Joi.object({
  price: Joi.number().optional().min(0), // Minor units
  started_at: Joi.date().optional(),
  ended_at: Joi.date().optional().allow(null),
})

export const getProgramListSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  q: Joi.string().allow('').optional(),
  branch_id: Joi.string().uuid().optional(),
})
