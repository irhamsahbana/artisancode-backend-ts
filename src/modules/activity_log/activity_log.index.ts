import { Hono } from 'hono'

import { authenticate } from '@/common/middlewares/auth.middleware'
import { validate, validateQuery } from '@/common/middlewares/validation.middleware'

import { createActivityLogHandlerDeps } from './activity_log.handler'
import { createActivityLogRepo } from './activity_log.repo'
import * as Schema from './activity_log.schema'
import { createActivityLogUsecase } from './activity_log.usecase'

const repo = createActivityLogRepo()
const usecase = createActivityLogUsecase(repo)
const handler = createActivityLogHandlerDeps(usecase)

const router = new Hono()

router.post('/', authenticate, validate(Schema.createActivityLogSchema), handler.create)
router.get('/:id', authenticate, handler.findById)
router.get('/', authenticate, validateQuery(Schema.getActivityLogListSchema), handler.findList)

export default router
