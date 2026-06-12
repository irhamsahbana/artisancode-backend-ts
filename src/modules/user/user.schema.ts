import { z } from 'zod'

import { UserStatuses } from '@/entities/user.entity'

export const createUserSchema = z.object({
  name: z.string().min(3).max(100),
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
  email: z.email(),
  phone: z.string().max(20),
  company_id: z.uuid(),
  role_id: z.uuid(),
  status: z.enum(UserStatuses as [string, ...string[]]).optional(),
})

export const registerSchema = z.object({
  company_name: z.string().min(3).max(100),
  name: z.string().min(3).max(100),
  username: z.string().min(3).max(50),
  email: z.email(),
  password: z.string().min(6).max(100),
  phone: z.string().max(20),
})

export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
})

export const getUserListSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().optional(),
})
