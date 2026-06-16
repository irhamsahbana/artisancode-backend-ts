import { Hono } from 'hono'

import { authenticate } from '@/common/middlewares/auth.middleware'
import { validate, validateQuery } from '@/common/middlewares/validation.middleware'

import { createCompanyHandlerDeps } from './company.handler'
import { createCompanyRepo } from './company.repo'
import * as Schema from './company.schema'
import { createCompanyUsecase } from './company.usecase'

// Re-export error codes for external consumers
export { CompanyErrorCode } from './company.errors'

const repo = createCompanyRepo()
const usecase = createCompanyUsecase(repo)
const handler = createCompanyHandlerDeps(usecase)

const router = new Hono()

router.post('/', authenticate, validate(Schema.createCompanySchema), handler.create)
router.get('/', authenticate, validateQuery(Schema.getCompanyListSchema), handler.findList)
router.get('/:id', authenticate, handler.findById)
router.put('/:id', authenticate, validate(Schema.updateCompanySchema), handler.update)
router.delete('/:id', authenticate, handler.delete)

export default router
