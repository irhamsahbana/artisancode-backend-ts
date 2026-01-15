import Joi from 'joi'

export const createStudentSchema = Joi.object({
  branch_id: Joi.string().uuid().required(),
  first_name: Joi.string().required().min(2).max(100),
  last_name: Joi.string().required().min(2).max(100),
  gender: Joi.string().required().valid('Male', 'Female'),
  date_of_birth: Joi.date().required(),
  birth_place: Joi.string().optional().allow('').max(100),
  email: Joi.string().email().required(),
  address: Joi.string().optional().allow('').max(500),
  photo_url: Joi.string().optional().allow(''),
  parent_name: Joi.string().optional().allow('').max(100),
  parent_phone: Joi.string().optional().allow('').max(20),
  parent_email: Joi.string().optional().allow('').email(),
  emergency_contact_phone: Joi.string().optional().allow('').max(20),
  blood_type: Joi.string().optional().allow('').max(3),
  medical_notes: Joi.string().optional().allow('').max(500),
  status: Joi.string().optional().valid('active', 'inactive'),
})

export const updateStudentSchema = Joi.object({
  branch_id: Joi.string().uuid().optional(),
  first_name: Joi.string().optional().min(2).max(100),
  last_name: Joi.string().optional().min(2).max(100),
  gender: Joi.string().optional().valid('Male', 'Female'),
  date_of_birth: Joi.date().optional(),
  birth_place: Joi.string().optional().allow('').max(100),
  email: Joi.string().email().optional(),
  address: Joi.string().optional().allow('').max(500),
  photo_url: Joi.string().optional().allow(''),
  parent_name: Joi.string().optional().allow('').max(100),
  parent_phone: Joi.string().optional().allow('').max(20),
  parent_email: Joi.string().optional().allow('').email(),
  emergency_contact_phone: Joi.string().optional().allow('').max(20),
  blood_type: Joi.string().optional().allow('').max(3),
  medical_notes: Joi.string().optional().allow('').max(500),
  status: Joi.string().optional().valid('active', 'inactive'),
})

export const getStudentListSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  q: Joi.string().allow('').optional(),
  branch_id: Joi.string().uuid().optional(),
  age: Joi.number().integer().min(0).optional(),
})
