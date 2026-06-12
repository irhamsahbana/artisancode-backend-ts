import { Hono } from 'hono'

import { authenticate } from '@/common/middlewares/auth.middleware'
import { validate, validateQuery } from '@/common/middlewares/validation.middleware'

import { createBranchHandlerDeps } from './branch.handler'
import { createBranchRepo } from './branch.repo'
import * as Schema from './branch.schema'
import { createBranchUsecase } from './branch.usecase'

const repo = createBranchRepo()
const usecase = createBranchUsecase(repo)
const handler = createBranchHandlerDeps(usecase)

const router = new Hono()

router.post('/', authenticate, validate(Schema.createBranchSchema), handler.create)
router.put('/:id', authenticate, validate(Schema.updateBranchSchema), handler.update)
router.delete('/:id', authenticate, handler.delete)
router.get('/:id', authenticate, handler.findById)
router.get('/', authenticate, validateQuery(Schema.getBranchListSchema), handler.findList)

export default router
