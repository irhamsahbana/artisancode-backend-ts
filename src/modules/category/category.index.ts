import { Router } from 'express'

import { authenticate } from '@/common/middlewares/auth.middleware'
import { validate, validateQuery } from '@/common/middlewares/validation.middleware'

import CategoryHandler from './category.handler'
import CategoryRepo from './category.repo'
import * as Schema from './category.schema'
import CategoryUsecase from './category.usecase'

const repo = new CategoryRepo()
const usecase = new CategoryUsecase(repo)
const handler = new CategoryHandler(usecase)

const router = Router()

router.post('/', authenticate, validate(Schema.createCategorySchema), handler.create)
router.put('/:id', authenticate, validate(Schema.updateCategorySchema), handler.update)
router.delete('/:id', authenticate, handler.delete)
router.get('/:id', authenticate, handler.findById)
router.get('/', authenticate, validateQuery(Schema.getCategoryListSchema), handler.findList)

export default router
