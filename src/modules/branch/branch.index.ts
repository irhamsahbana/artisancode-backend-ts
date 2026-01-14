import { Router } from 'express'

import { authenticate } from '@/common/middlewares/auth.middleware'
import { validate, validateQuery } from '@/common/middlewares/validation.middleware'

import BranchHandler from './branch.handler'
import BranchRepo from './branch.repo'
import * as Schema from './branch.schema'
import BranchUsecase from './branch.usecase'

const repo = new BranchRepo()
const usecase = new BranchUsecase(repo)
const handler = new BranchHandler(usecase)

const router = Router()

router.post('/', authenticate, validate(Schema.createBranchSchema), handler.create)
router.put('/:id', authenticate, validate(Schema.updateBranchSchema), handler.update)
router.delete('/:id', authenticate, handler.delete)
router.get('/:id', authenticate, handler.findById)
router.get('/', authenticate, validateQuery(Schema.getBranchListSchema), handler.findList)

export default router
