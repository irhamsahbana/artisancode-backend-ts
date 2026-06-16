import { Hono } from 'hono'

import { authenticate } from '@/common/middlewares/auth.middleware'
import { validate } from '@/common/middlewares/validation.middleware'
import { createPaymentGateway } from '@/integrations'

import { createInvoiceHandlerDeps } from './invoice.handler'
import { createInvoiceRepo } from './invoice.repo'
import { createInvoiceSchema } from './invoice.schema'
import { createInvoiceUsecase } from './invoice.usecase'

// Re-export error codes for external consumers
export { InvoiceErrorCode } from './invoice.errors'

const router = new Hono()

const repo = createInvoiceRepo()
const paymentGateway = createPaymentGateway()
const usecase = createInvoiceUsecase(repo, paymentGateway)
const handler = createInvoiceHandlerDeps(usecase)

router.post('/', authenticate, validate(createInvoiceSchema), handler.create)
router.get('/', authenticate, handler.findList)
router.get('/:id', authenticate, handler.findById)

export default router
