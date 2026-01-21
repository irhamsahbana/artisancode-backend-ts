import { Router } from 'express'

import { authenticate } from '@/common/middlewares/auth.middleware'
import { validate, validateQuery } from '@/common/middlewares/validation.middleware'
import BranchRepo from '@/modules/branch/branch.repo'
import EnrollmentRepo from '@/modules/enrollment/enrollment.repo'

import ProgramHandler from './program.handler'
import ProgramRepo from './program.repo'
import * as Schema from './program.schema'
import ProgramUsecase from './program.usecase'

const repo = new ProgramRepo()
const branchRepo = new BranchRepo()
const enrollmentRepo = new EnrollmentRepo()
const usecase = new ProgramUsecase(repo, branchRepo, enrollmentRepo)
const handler = new ProgramHandler(usecase)

const router = Router()

router.post('/', authenticate, validate(Schema.createProgramSchema), handler.create)
router.put('/:id', authenticate, validate(Schema.updateProgramSchema), handler.update)
router.delete('/:id', authenticate, handler.delete)
router.get('/:id', authenticate, handler.findById)
router.get('/', authenticate, validateQuery(Schema.getProgramListSchema), handler.findList)

// New endpoints
router.post('/:id/schedules', authenticate, validate(Schema.addScheduleSchema), handler.addSchedule)
router.post('/:id/pricings', authenticate, validate(Schema.addPricingSchema), handler.addPricing)
router.post('/:id/pricings/:pricingId/prices', authenticate, validate(Schema.addPriceSchema), handler.addPrice)
router.put('/:id/pricings/:pricingId/prices/:priceId', authenticate, validate(Schema.updatePriceSchema), handler.updatePrice)
router.delete('/:id/schedules/:scheduleId', authenticate, handler.deleteSchedule)
router.delete('/:id/pricings/:pricingId', authenticate, handler.deletePricing)

export default router
