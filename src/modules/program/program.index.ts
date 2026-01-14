import { Router } from 'express'

import { authenticate } from '@/common/middlewares/auth.middleware'
import { validate, validateQuery } from '@/common/middlewares/validation.middleware'
import BranchRepo from '@/modules/branch/branch.repo'
import CategoryRepo from '@/modules/category/category.repo'

import ProgramHandler from './program.handler'
import ProgramRepo from './program.repo'
import * as Schema from './program.schema'
import ProgramUsecase from './program.usecase'

const repo = new ProgramRepo()
const branchRepo = new BranchRepo()
const categoryRepo = new CategoryRepo()
const usecase = new ProgramUsecase(repo, branchRepo, categoryRepo)
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

export default router
