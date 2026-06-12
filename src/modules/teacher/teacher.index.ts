import { Hono } from 'hono'

import { authenticate } from '@/common/middlewares/auth.middleware'
import { validate, validateQuery } from '@/common/middlewares/validation.middleware'

import { createTeacherHandlerDeps } from './teacher.handler'
import { createTeacherRepo } from './teacher.repo'
import * as Schema from './teacher.schema'
import { createTeacherUsecase } from './teacher.usecase'

const repo = createTeacherRepo()
const usecase = createTeacherUsecase(repo)
const handler = createTeacherHandlerDeps(usecase)

const router = new Hono()

router.post('/', authenticate, validate(Schema.createTeacherSchema), handler.create)
router.put('/:id', authenticate, validate(Schema.updateTeacherSchema), handler.update)
router.delete('/:id', authenticate, handler.delete)
router.get('/:id', authenticate, handler.findById)
router.get('/', authenticate, validateQuery(Schema.getTeacherListSchema), handler.findList)

export default router
