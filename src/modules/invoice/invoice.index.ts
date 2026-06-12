import { Hono } from 'hono'

import { authenticate } from '@/common/middlewares/auth.middleware'
import { validate } from '@/common/middlewares/validation.middleware'
import { DokuProvider } from '@/providers/doku'

import InvoiceHandler from './invoice.handler'
import InvoiceRepo from './invoice.repo'
import { createInvoiceSchema } from './invoice.schema'
import InvoiceUsecase from './invoice.usecase'

const router = new Hono()

const repo = new InvoiceRepo()
const dokuProvider = new DokuProvider()
const usecase = new InvoiceUsecase(repo, dokuProvider)
const handler = new InvoiceHandler(usecase)

router.post('/', authenticate, validate(createInvoiceSchema), handler.create)
router.get('/', authenticate, handler.findList)
router.get('/:id', authenticate, handler.findById)

export default router
