import { boolean, index, pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { defaultId, softDelete, timestamps } from './helpers'
import { fileStatusEnum } from '../enums'

export const storageFiles = pgTable(
  'storage_files',
  {
    id: defaultId,
    companyId: uuid('company_id').notNull(),
    createdBy: uuid('created_by').notNull(),
    folder: text('folder').notNull().default(''),
    objectKey: text('object_key').notNull(),
    originalFilename: text('original_filename').notNull(),
    contentType: text('content_type'),
    isPublic: boolean('is_public').notNull().default(false),
    status: fileStatusEnum('status').notNull().default('pending'),
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    index('idx_storage_files_company_status').on(t.companyId, t.status),
    index('idx_storage_files_object_key').on(t.objectKey),
  ],
)
