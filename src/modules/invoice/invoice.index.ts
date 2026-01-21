import { Router } from 'express'

import { InvoiceHandler } from './invoice.handler'
import { InvoiceRepo } from './invoice.repo'
import { createInvoiceSchema } from './invoice.schema'
import { InvoiceUsecase } from './invoice.usecase'
import { authenticate } from '../../common/middlewares/auth.middleware'
import { validate } from '../../common/middlewares/validation.middleware'
import { DokuProvider } from '../../providers/doku'

const InvoiceRouter = Router()

const repo = new InvoiceRepo()
const dokuProvider = new DokuProvider()
const usecase = new InvoiceUsecase(repo, dokuProvider)
const handler = new InvoiceHandler(usecase)

InvoiceRouter.post('/', authenticate, validate(createInvoiceSchema), handler.create)
InvoiceRouter.get('/', authenticate, handler.getAll)
InvoiceRouter.get('/:id', authenticate, handler.getOne)
InvoiceRouter.post('/:id/generate-payment-link', authenticate, handler.generatePaymentLink)

export default InvoiceRouter
