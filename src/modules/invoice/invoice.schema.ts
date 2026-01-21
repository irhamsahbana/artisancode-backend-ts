import Joi from 'joi'

export const createInvoiceSchema = Joi.object({
  enrollment_id: Joi.string().required(),
  amount: Joi.number().min(0).required(),
  due_date: Joi.date().required(),
  issued_date: Joi.date().optional(),
})

export const updateInvoiceSchema = Joi.object({
  status: Joi.string().optional(),
  paid_at: Joi.date().optional(),
})
