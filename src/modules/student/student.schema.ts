import { z } from 'zod'

import { StudentStatuses } from '@/entities/student.entity'

export const createStudentSchema = z.object({
  branch_id: z.uuid(),
  first_name: z.string().min(2).max(100),
  last_name: z.string().min(2).max(100),
  gender: z.enum(['Male', 'Female']),
  date_of_birth: z.coerce.date(),
  birth_place: z.string().max(100).optional(),
  email: z.email().optional(),
  address: z.string().max(500).optional(),
  photo_url: z.string().optional(),
  parent_name: z.string().max(100).optional(),
  parent_phone: z.string().max(20).optional(),
  parent_email: z.email().optional(),
  emergency_contact_phone: z.string().max(20).optional(),
  blood_type: z.string().optional(),
  medical_notes: z.string().max(500).optional(),
  status: z.enum(StudentStatuses as [string, ...string[]]).optional(),
})

export const updateStudentSchema = z.object({
  branch_id: z.uuid().optional(),
  first_name: z.string().min(2).max(100).optional(),
  last_name: z.string().min(2).max(100).optional(),
  gender: z.enum(['Male', 'Female']).optional(),
  date_of_birth: z.coerce.date().optional(),
  birth_place: z.string().max(100).optional(),
  email: z.email().optional(),
  address: z.string().max(500).optional(),
  photo_url: z.string().optional(),
  parent_name: z.string().max(100).optional(),
  parent_phone: z.string().max(20).optional(),
  parent_email: z.email().optional(),
  emergency_contact_phone: z.string().max(20).optional(),
  blood_type: z.string().optional(),
  medical_notes: z.string().max(500).optional(),
  status: z.enum(StudentStatuses as [string, ...string[]]).optional(),
})

export const getStudentListSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().optional(),
  branch_id: z.uuid().optional(),
  age: z.coerce.number().int().min(0).optional(),
})
