import { Router } from 'express'

import { authenticate } from '@/common/middlewares/auth.middleware'
import { validate, validateQuery } from '@/common/middlewares/validation.middleware'
import BranchRepo from '@/modules/branch/branch.repo'

import StudentHandler from './student.handler'
import StudentRepo from './student.repo'
import * as Schema from './student.schema'
import StudentUsecase from './student.usecase'

const repo = new StudentRepo()
const branchRepo = new BranchRepo()
const usecase = new StudentUsecase(repo, branchRepo)
const handler = new StudentHandler(usecase)

const router = Router()

router.post('/', authenticate, validate(Schema.createStudentSchema), handler.create)
router.put('/:id', authenticate, validate(Schema.updateStudentSchema), handler.update)
router.delete('/:id', authenticate, handler.delete)
router.get('/:id', authenticate, handler.findById)
router.get('/', authenticate, validateQuery(Schema.getStudentListSchema), handler.findList)

export default router
