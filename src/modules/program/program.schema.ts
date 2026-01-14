import Joi from 'joi'

const programScheduleSchema = Joi.object({
  day: Joi.string()
    .required()
    .valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
  start_time: Joi.string()
    .required()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/), // HH:mm
  end_time: Joi.string()
    .required()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/), // HH:mm
})

export const createProgramSchema = Joi.object({
  branch_id: Joi.string().uuid().optional().allow(null),
  age_category_id: Joi.string().uuid().optional().allow(null),
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().optional().allow('').max(500),
  status: Joi.string().optional().valid('active', 'inactive'),
  schedules: Joi.array().items(programScheduleSchema).optional(),
  teachers: Joi.array().items(Joi.string().uuid()).optional(),
})

export const updateProgramSchema = Joi.object({
  branch_id: Joi.string().uuid().optional().allow(null),
  age_category_id: Joi.string().uuid().optional().allow(null),
  name: Joi.string().optional().min(2).max(100),
  description: Joi.string().optional().allow('').max(500),
  status: Joi.string().optional().valid('active', 'inactive'),
  schedules: Joi.array().items(programScheduleSchema).optional(),
  teachers: Joi.array().items(Joi.string().uuid()).optional(),
})

export const getProgramListSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  q: Joi.string().allow('').optional(),
  branch_id: Joi.string().uuid().optional(),
})
