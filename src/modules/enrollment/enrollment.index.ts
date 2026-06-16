import { Hono } from 'hono'

import { transactor } from '@/common/executor'
import { authenticate } from '@/common/middlewares/auth.middleware'
import { validate, validateQuery } from '@/common/middlewares/validation.middleware'
import { createPaymentGateway, createStorageService } from '@/integrations'
import { createBranchRepo } from '@/modules/branch/branch.repo'
import { createInvoiceRepo } from '@/modules/invoice/invoice.repo'
import { createInvoiceUsecase } from '@/modules/invoice/invoice.usecase'
import { createProgramRepo } from '@/modules/program/program.repo'
import { createStudentRepo } from '@/modules/student/student.repo'

import { createEnrollmentHandlerDeps } from './enrollment.handler'
import { createEnrollmentRepo } from './enrollment.repo'
import * as Schema from './enrollment.schema'
import { createEnrollmentUsecase } from './enrollment.usecase'

// Re-export error codes for external consumers
export { EnrollmentErrorCode } from './enrollment.errors'

const repo = createEnrollmentRepo()
const branchRepo = createBranchRepo()
const studentRepo = createStudentRepo()
const programRepo = createProgramRepo()

const invoiceRepo = createInvoiceRepo()
const paymentGateway = createPaymentGateway()
const invoiceUsecase = createInvoiceUsecase(invoiceRepo, paymentGateway)
const storage = createStorageService()

const usecase = createEnrollmentUsecase(
  repo,
  branchRepo,
  studentRepo,
  programRepo,
  invoiceUsecase,
  transactor,
  storage,
)
const handler = createEnrollmentHandlerDeps(usecase)

const router = new Hono()

router.post('/', authenticate, validate(Schema.createEnrollmentSchema), handler.create)
router.put('/:id', authenticate, validate(Schema.updateEnrollmentSchema), handler.update)
router.post('/:id/invoices', authenticate, handler.generateInvoice)
router.delete('/:id', authenticate, handler.delete)
router.get('/:id', authenticate, handler.findById)
router.get('/', authenticate, validateQuery(Schema.getEnrollmentListSchema), handler.findList)

export default router
