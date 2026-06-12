import { Hono } from 'hono'

import { authenticate } from '@/common/middlewares/auth.middleware'
import { validate, validateQuery } from '@/common/middlewares/validation.middleware'
import { createBranchRepo } from '@/modules/branch/branch.repo'

import { createStudentHandlerDeps } from './student.handler'
import { createStudentRepo } from './student.repo'
import * as Schema from './student.schema'
import { createStudentUsecase } from './student.usecase'

const repo = createStudentRepo()
const branchRepo = createBranchRepo()
const usecase = createStudentUsecase(repo, branchRepo)
const handler = createStudentHandlerDeps(usecase)

const router = new Hono()

router.post('/', authenticate, validate(Schema.createStudentSchema), handler.create)
router.put('/:id', authenticate, validate(Schema.updateStudentSchema), handler.update)
router.delete('/:id', authenticate, handler.delete)
router.get('/:id', authenticate, handler.findById)
router.get('/', authenticate, validateQuery(Schema.getStudentListSchema), handler.findList)

export default router
