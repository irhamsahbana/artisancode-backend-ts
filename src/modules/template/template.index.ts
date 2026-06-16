import { Hono } from 'hono'

import TemplateHandler from './template.handler'
import TemplateRepo from './template.repo'
import TemplateUsecase from './template.usecase'

// Re-export error codes for external consumers
export { TemplateErrorCode } from './template.errors'

const repo = new TemplateRepo()
const usecase = new TemplateUsecase(repo)
const handler = new TemplateHandler(usecase)

const router = new Hono()

router.get('/', handler.getSomething)

export default router
