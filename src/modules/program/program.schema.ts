import { z } from 'zod'

import { ProgramStatuses } from '@/entities/program.entity'

const programScheduleSchema = z.object({
  id: z.uuid().nullable().optional(),
  day: z
    .enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .optional(),
  start_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional(),
  end_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional(),
})

const programPriceSchema = z.object({
  id: z.uuid().nullable().optional(),
  currency: z.string().length(3),
  price: z.number().min(0),
  started_at: z.coerce.date().optional(),
  ended_at: z.coerce.date().nullable().optional(),
})

const programPricingSchema = z.object({
  id: z.uuid().nullable().optional(),
  name: z.string(),
  description: z.string().optional(),
  prices: z.array(programPriceSchema).min(1),
})

export const createProgramSchema = z.object({
  branch_id: z.uuid().nullable().optional(),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  capacity: z.number().min(0).optional(),
  status: z.enum(ProgramStatuses as [string, ...string[]]).optional(),
  schedules: z.array(programScheduleSchema).optional(),
  pricings: z.array(programPricingSchema).optional(),
  teachers: z.array(z.uuid()).optional(),
})

export const updateProgramSchema = z.object({
  branch_id: z.uuid().nullable().optional(),
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  capacity: z.number().min(0).optional(),
  status: z.enum(ProgramStatuses as [string, ...string[]]).optional(),
})

export const updateProgramAllSchema = z.object({
  branch_id: z.uuid().nullable().optional(),
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  capacity: z.number().min(0).optional(),
  status: z.enum(ProgramStatuses as [string, ...string[]]).optional(),
  schedules: z.array(programScheduleSchema).optional(),
  pricings: z.array(programPricingSchema).optional(),
  teachers: z.array(z.uuid()).optional(),
})

export const addScheduleSchema = programScheduleSchema

export const addPricingSchema = programPricingSchema

export const addPriceSchema = programPriceSchema

export const updatePriceSchema = z.object({
  price: z.number().min(0).optional(),
  started_at: z.coerce.date().optional(),
  ended_at: z.coerce.date().nullable().optional(),
})

export const getProgramListSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().optional(),
  branch_id: z.uuid().optional(),
})
