import { Router } from 'express'

import { authenticate } from '@/common/middlewares/auth.middleware'
import { validate, validateQuery } from '@/common/middlewares/validation.middleware'
import BranchRepo from '@/modules/branch/branch.repo'
import ProgramRepo from '@/modules/program/program.repo'
import StudentRepo from '@/modules/student/student.repo'

import EnrollmentHandler from './enrollment.handler'
import EnrollmentRepo from './enrollment.repo'
import * as Schema from './enrollment.schema'
import EnrollmentUsecase from './enrollment.usecase'

const repo = new EnrollmentRepo()
const branchRepo = new BranchRepo()
const studentRepo = new StudentRepo()
const programRepo = new ProgramRepo()
const usecase = new EnrollmentUsecase(repo, branchRepo, studentRepo, programRepo)
const handler = new EnrollmentHandler(usecase)

const router = Router()

router.post('/', authenticate, validate(Schema.createEnrollmentSchema), handler.create)
router.put('/:id', authenticate, validate(Schema.updateEnrollmentSchema), handler.update)
router.delete('/:id', authenticate, handler.delete)
router.get('/:id', authenticate, handler.findById)
router.get('/', authenticate, validateQuery(Schema.getEnrollmentListSchema), handler.findList)

export default router
