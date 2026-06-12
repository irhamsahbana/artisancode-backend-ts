import { Hono } from 'hono'

import { authenticate } from '@/common/middlewares/auth.middleware'
import { validate, validateQuery } from '@/common/middlewares/validation.middleware'

import { createUserHandlerDeps } from './user.handler'
import { createUserRepo } from './user.repo'
import * as Schema from './user.schema'
import { createUserUsecase } from './user.usecase'

const router = new Hono()
const repo = createUserRepo()
const usecase = createUserUsecase(repo)
const handler = createUserHandlerDeps(usecase)

router.post('/register', validate(Schema.registerSchema), handler.register)

router.post('/', authenticate, validate(Schema.createUserSchema), handler.create)
router.post('/login', validate(Schema.loginSchema), handler.login)
router.get('/', authenticate, validateQuery(Schema.getUserListSchema), handler.findList)
router.get('/:id', authenticate, handler.findById)

export default router
