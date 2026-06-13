import { z } from 'zod'

export const createActivityLogSchema = z.object({
  branch_id: z.uuid().nullable().optional(),
  user_id: z.uuid(),
  entity_name: z.string().min(1).max(100),
  entity_id: z.string().min(1),
  activity: z.string().min(1).max(255),
  before: z.record(z.string(), z.unknown()).nullable().optional(),
  after: z.record(z.string(), z.unknown()).nullable().optional(),
})

export const getActivityLogListSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().optional(),
  branch_id: z.uuid().optional(),
  user_id: z.uuid().optional(),
  entity_name: z.string().optional(),
})
