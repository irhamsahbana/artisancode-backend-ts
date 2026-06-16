import { Hono } from 'hono'

import { authenticate } from '@/common/middlewares/auth.middleware'
import { validate, validateQuery } from '@/common/middlewares/validation.middleware'
import { createBranchRepo } from '@/modules/branch/branch.repo'
import { createEnrollmentRepo } from '@/modules/enrollment/enrollment.repo'

import { createProgramHandlerDeps } from './program.handler'
import { createProgramRepo } from './program.repo'
import * as Schema from './program.schema'
import { createProgramUsecase } from './program.usecase'

// Re-export error codes for external consumers
export { ProgramErrorCode } from './program.errors'

const repo = createProgramRepo()
const branchRepo = createBranchRepo()
const enrollmentRepo = createEnrollmentRepo()
const usecase = createProgramUsecase(repo, branchRepo, enrollmentRepo)
const handler = createProgramHandlerDeps(usecase)

const router = new Hono()

router.post('/', authenticate, validate(Schema.createProgramSchema), handler.create)
router.put('/:id', authenticate, validate(Schema.updateProgramSchema), handler.update)
router.put('/:id/all', authenticate, validate(Schema.updateProgramAllSchema), handler.updateAll)
router.delete('/:id', authenticate, handler.delete)
router.get('/:id', authenticate, handler.findById)
router.get('/', authenticate, validateQuery(Schema.getProgramListSchema), handler.findList)

// New endpoints
router.post('/:id/schedules', authenticate, validate(Schema.addScheduleSchema), handler.addSchedule)
router.post('/:id/pricings', authenticate, validate(Schema.addPricingSchema), handler.addPricing)
router.post(
  '/:id/pricings/:pricingId/prices',
  authenticate,
  validate(Schema.addPriceSchema),
  handler.addPrice,
)
router.put(
  '/:id/pricings/:pricingId/prices/:priceId',
  authenticate,
  validate(Schema.updatePriceSchema),
  handler.updatePrice,
)
router.delete('/:id/schedules/:scheduleId', authenticate, handler.deleteSchedule)
router.delete('/:id/pricings/:pricingId', authenticate, handler.deletePricing)

export default router
