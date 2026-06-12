import { z } from 'zod'

import { TeacherStatuses } from '@/entities/teacher.entity'

export const createTeacherSchema = z.object({
  branch_id: z.uuid().nullable().optional(),
  status: z.enum(TeacherStatuses as [string, ...string[]]).optional(),
  name: z.string().min(2).max(100),
  email: z.email(),
  phone: z.string().max(20).optional(),
  address: z.string().max(255).optional(),
  birth_date: z.string().optional(),
  biography: z.string().optional(),
  specialty: z.string().max(100).optional(),
})

export const updateTeacherSchema = z.object({
  branch_id: z.uuid().nullable().optional(),
  status: z.enum(TeacherStatuses as [string, ...string[]]).optional(),
  name: z.string().min(2).max(100).optional(),
  email: z.email().optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(255).optional(),
  birth_date: z.string().optional(),
  biography: z.string().optional(),
  specialty: z.string().max(100).optional(),
})

export const getTeacherListSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().optional(),
  branch_id: z.uuid().optional(),
})
