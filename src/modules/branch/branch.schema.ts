import { z } from 'zod'

import { BranchStatuses } from '@/entities/branch.entity'

export const createBranchSchema = z.object({
  name: z.string().min(3).max(100),
  city: z.string().min(2).max(100),
  capacity: z.number().int().min(1).optional(),
  description: z.string().max(500).optional(),
  address: z.string().max(255).optional(),
  phone: z.string().max(20).optional(),
  email: z.email().optional(),
  head_coach: z.string().max(100).optional(),
  status: z.enum(BranchStatuses as [string, ...string[]]).optional(),
})

export const updateBranchSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  city: z.string().min(2).max(100).optional(),
  capacity: z.number().int().min(1).optional(),
  description: z.string().max(500).optional(),
  address: z.string().max(255).optional(),
  phone: z.string().max(20).optional(),
  email: z.email().optional(),
  head_coach: z.string().max(100).optional(),
  status: z.enum(BranchStatuses as [string, ...string[]]).optional(),
})

export const getBranchListSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().optional(),
  status: z.enum(BranchStatuses as [string, ...string[]]).optional(),
})
