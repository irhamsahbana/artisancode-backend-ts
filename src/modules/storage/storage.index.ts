import { Hono } from 'hono'

import { authenticate } from '@/common/middlewares/auth.middleware'
import { validate } from '@/common/middlewares/validation.middleware'
import { createStorageService } from '@/integrations'

import { createStorageHandlerDeps } from './storage.handler'
import { createStorageRepo } from './storage.repo'
import * as Schema from './storage.schema'
import { createStorageUsecase } from './storage.usecase'

const storage = createStorageService()
const repo = createStorageRepo()
const usecase = createStorageUsecase(storage, repo)
const handler = createStorageHandlerDeps(usecase)

const router = new Hono()

router.post('/upload', authenticate, validate(Schema.uploadFileSchema), handler.uploadFile)
router.post('/upload-url', authenticate, validate(Schema.createUploadUrlSchema), handler.createUploadUrl)
router.delete('/:id', authenticate, handler.deleteFile)
router.get('/:id/url', authenticate, handler.getFileUrl)
router.post('/cleanup', authenticate, validate(Schema.cleanupExpiredSchema), handler.cleanupExpired)

export default router
