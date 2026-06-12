import { z } from 'zod'

import { InvoiceStatuses } from '@/entities/invoice.entity'

export const createInvoiceSchema = z.object({
  enrollment_id: z.string(),
  amount: z.number().min(0),
  due_date: z.coerce.date(),
  issued_date: z.coerce.date().optional(),
  status: z.enum(InvoiceStatuses as [string, ...string[]]).optional(),
})

export const updateInvoiceSchema = z.object({
  status: z.enum(InvoiceStatuses as [string, ...string[]]).optional(),
  paid_at: z.coerce.date().optional(),
})
