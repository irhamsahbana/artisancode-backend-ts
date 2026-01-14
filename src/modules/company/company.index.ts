import { Router } from 'express'

import { authenticate } from '@/common/middlewares/auth.middleware'
import { validate, validateQuery } from '@/common/middlewares/validation.middleware'

import CompanyHandler from './company.handler'
import CompanyRepo from './company.repo'
import * as Schema from './company.schema'
import CompanyUsecase from './company.usecase'

const repo = new CompanyRepo()
const usecase = new CompanyUsecase(repo)
const handler = new CompanyHandler(usecase)

const router = Router()

router.post('/', authenticate, validate(Schema.createCompanySchema), handler.create)
router.get('/', authenticate, validateQuery(Schema.getCompanyListSchema), handler.findList)
router.get('/:id', authenticate, handler.findById)
router.put('/:id', authenticate, validate(Schema.updateCompanySchema), handler.update)
router.delete('/:id', authenticate, handler.delete)

export default router
