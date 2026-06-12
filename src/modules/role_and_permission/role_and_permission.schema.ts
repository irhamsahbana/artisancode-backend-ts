import { z } from 'zod'

// Role Schemas
export const createRoleSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  permission_ids: z.array(z.uuid()).optional(),
})

export const updateRoleSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  permission_ids: z.array(z.uuid()).optional(),
})

export const getRoleListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  q: z.string().optional(),
  ids: z.string().optional(),
})

// Permission Schemas
export const getPermissionListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  q: z.string().optional(),
})
