import { Router } from 'express'

import TemplateHandler from './template.handler'
import TemplateRepo from './template.repo'
import TemplateUsecase from './template.usecase'

const repo = new TemplateRepo()
const usecase = new TemplateUsecase(repo)
const handler = new TemplateHandler(usecase)

const router = Router()

router.get('/', handler.getSomething)

export default router
