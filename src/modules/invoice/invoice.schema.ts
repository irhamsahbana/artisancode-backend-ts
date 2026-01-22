import Joi from 'joi'

import { InvoiceStatuses } from '@/entities/invoice.entity'

export const createInvoiceSchema = Joi.object({
  enrollment_id: Joi.string().required(),
  amount: Joi.number().min(0).required(),
  due_date: Joi.date().required(),
  issued_date: Joi.date().optional(),
  status: Joi.string()
    .optional()
    .valid(...InvoiceStatuses),
})

export const updateInvoiceSchema = Joi.object({
  status: Joi.string()
    .optional()
    .valid(...InvoiceStatuses),
  paid_at: Joi.date().optional(),
})
