import { z } from 'zod'

import { EnrollmentStatuses } from '@/entities/enrollment.entity'

const validBillingTypes = ['one_time', 'monthly', 'quarterly', 'annually'] as const

export const createEnrollmentSchema = z.object({
  branch_id: z.string().uuid(),
  student_id: z.string().uuid(),
  program_id: z.string().uuid(),
  pricing_id: z.string().uuid(),
  currency: z.string().optional(),
  enrollment_date: z.coerce.date().optional(),
  status: z.enum(EnrollmentStatuses as [string, ...string[]]).optional(),
  billing_cycle: z.enum(validBillingTypes).optional(),
  next_payment_date: z.coerce.date().nullable().optional(),
  generate_invoice: z.boolean().default(false),
})

export const updateEnrollmentSchema = z.object({
  branch_id: z.string().uuid().optional(),
  student_id: z.string().uuid().optional(),
  program_id: z.string().uuid().optional(),
  pricing_id: z.string().uuid().optional(),
  currency: z.string().optional(),
  enrollment_date: z.coerce.date().optional(),
  status: z.enum(EnrollmentStatuses as [string, ...string[]]).optional(),
  billing_cycle: z.enum(validBillingTypes).optional(),
  next_payment_date: z.coerce.date().nullable().optional(),
})

export const getEnrollmentListSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  branch_id: z.string().uuid().optional(),
  student_id: z.string().uuid().optional(),
  program_id: z.string().uuid().optional(),
})
