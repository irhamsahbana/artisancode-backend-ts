import { Router } from 'express'

import { authenticate } from '@/common/middlewares/auth.middleware'
import { validate, validateQuery } from '@/common/middlewares/validation.middleware'

import UserHandler from './user.handler'
import UserRepo from './user.repo'
import * as Schema from './user.schema'
import UserUsecase from './user.usecase'

const router = Router()
const repo = new UserRepo()
const usecase = new UserUsecase(repo)
const handler = new UserHandler(usecase)

router.post(
  '/register',
  validate(Schema.registerSchema),
  handler.register
)

router.post(
  '/',
  authenticate,
  validate(Schema.createUserSchema),
  handler.create
)
router.post('/login', validate(Schema.loginSchema), handler.login)
router.get('/', authenticate, validateQuery(Schema.getUserListSchema), handler.findList)
router.get('/:id', authenticate, handler.findById)

export default router
