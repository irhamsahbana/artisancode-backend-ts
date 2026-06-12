import { z } from 'zod'

export const uploadFileSchema = z.object({
  folder: z.string().optional().default(''),
  filename: z.string().min(1),
  contentType: z.string().min(1),
  isPublic: z.boolean().optional().default(false),
})

export const createUploadUrlSchema = z.object({
  folder: z.string().optional().default(''),
  filename: z.string().min(1),
  originalFilename: z.string().min(1),
  contentType: z.string().min(1),
  isPublic: z.boolean().optional().default(false),
})

export const deleteFileSchema = z.object({
  id: z.string().uuid(),
})

export const cleanupExpiredSchema = z.object({
  before: z.string().datetime().optional(),
  limit: z.number().int().positive().optional().default(100),
})
