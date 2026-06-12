import { Hono } from 'hono'

import { authenticate } from '@/common/middlewares/auth.middleware'
import { validate, validateQuery } from '@/common/middlewares/validation.middleware'

import { createCategoryHandlerDeps } from './category.handler'
import { createCategoryRepo } from './category.repo'
import * as Schema from './category.schema'
import { createCategoryUsecase } from './category.usecase'

const repo = createCategoryRepo()
const usecase = createCategoryUsecase(repo)
const handler = createCategoryHandlerDeps(usecase)

const router = new Hono()

router.post('/', authenticate, validate(Schema.createCategorySchema), handler.create)
router.put('/:id', authenticate, validate(Schema.updateCategorySchema), handler.update)
router.delete('/:id', authenticate, handler.delete)
router.get('/:id', authenticate, handler.findById)
router.get('/', authenticate, validateQuery(Schema.getCategoryListSchema), handler.findList)

export default router
