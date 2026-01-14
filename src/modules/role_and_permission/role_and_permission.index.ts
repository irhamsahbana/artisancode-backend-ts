import { Router } from 'express'

import { authenticate } from '@/common/middlewares/auth.middleware'
import { validate, validateQuery } from '@/common/middlewares/validation.middleware'

import RoleAndPermissionHandler from './role_and_permission.handler'
import RoleAndPermissionRepo from './role_and_permission.repo'
import * as Schema from './role_and_permission.schema'
import RoleAndPermissionUsecase from './role_and_permission.usecase'

const repo = new RoleAndPermissionRepo()
const usecase = new RoleAndPermissionUsecase(repo)
const handler = new RoleAndPermissionHandler(usecase)

const router = Router()

// Role Routes
router.post('/roles', authenticate, validate(Schema.createRoleSchema), handler.createRole)
router.get('/roles', authenticate, validateQuery(Schema.getRoleListSchema), handler.findRoleList)
router.get('/roles/:id', authenticate, handler.findRoleById)
router.put('/roles/:id', authenticate, validate(Schema.updateRoleSchema), handler.updateRole)
router.delete('/roles/:id', authenticate, handler.deleteRole)

// Permission Routes
router.get(
  '/permissions',
  authenticate,
  validateQuery(Schema.getPermissionListSchema),
  handler.findPermissionList,
)

export default router
