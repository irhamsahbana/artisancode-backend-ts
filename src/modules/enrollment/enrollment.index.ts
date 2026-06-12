import { Hono } from 'hono'

import { transactor } from '@/common/executor'
import { authenticate } from '@/common/middlewares/auth.middleware'
import { validate, validateQuery } from '@/common/middlewares/validation.middleware'
import { createPaymentGateway } from '@/integrations'
import BranchRepo from '@/modules/branch/branch.repo'
import InvoiceRepo from '@/modules/invoice/invoice.repo'
import InvoiceUsecase from '@/modules/invoice/invoice.usecase'
import ProgramRepo from '@/modules/program/program.repo'
import StudentRepo from '@/modules/student/student.repo'

import EnrollmentHandler from './enrollment.handler'
import EnrollmentRepo from './enrollment.repo'
import * as Schema from './enrollment.schema'
import EnrollmentUsecase from './enrollment.usecase'

const repo = new EnrollmentRepo()
const branchRepo = new BranchRepo()
const studentRepo = new StudentRepo()
const programRepo = new ProgramRepo()

const invoiceRepo = new InvoiceRepo()
const paymentGateway = createPaymentGateway()
const invoiceUsecase = new InvoiceUsecase(invoiceRepo, paymentGateway)

const usecase = new EnrollmentUsecase(
  repo,
  branchRepo,
  studentRepo,
  programRepo,
  invoiceUsecase,
  transactor,
)
const handler = new EnrollmentHandler(usecase)

const router = new Hono()

router.post('/', authenticate, validate(Schema.createEnrollmentSchema), handler.create)
router.put('/:id', authenticate, validate(Schema.updateEnrollmentSchema), handler.update)
router.post('/:id/invoices', authenticate, handler.generateInvoice)
router.delete('/:id', authenticate, handler.delete)
router.get('/:id', authenticate, handler.findById)
router.get('/', authenticate, validateQuery(Schema.getEnrollmentListSchema), handler.findList)

export default router
