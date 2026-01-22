import { Router } from 'express'

import { authenticate } from '@/common/middlewares/auth.middleware'
import { validate } from '@/common/middlewares/validation.middleware'
import { DokuProvider } from '@/providers/doku'

import InvoiceHandler from './invoice.handler'
import InvoiceRepo from './invoice.repo'
import { createInvoiceSchema } from './invoice.schema'
import InvoiceUsecase from './invoice.usecase'

const router = Router()

const repo = new InvoiceRepo()
const dokuProvider = new DokuProvider()
const usecase = new InvoiceUsecase(repo, dokuProvider)
const handler = new InvoiceHandler(usecase)

router.post('/', authenticate, validate(createInvoiceSchema), handler.create)
router.get('/', authenticate, handler.findList)
router.get('/:id', authenticate, handler.findById)
router.post('/:id/generate-payment-link', authenticate, handler.generatePaymentLink)

export default router
