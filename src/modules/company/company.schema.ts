import { z } from 'zod'

import { CompanyStatuses } from '@/entities/company.entity'

export const createCompanySchema = z.object({
  name: z.string().min(3).max(100),
  status: z.enum(CompanyStatuses as [string, ...string[]]).optional(),
})

export const updateCompanySchema = z.object({
  name: z.string().min(3).max(100).optional(),
  status: z.enum(CompanyStatuses as [string, ...string[]]).optional(),
  accessible_company_id: z.uuid().optional(),
})

export const getCompanyListSchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  ids: z.string().optional(),
})
