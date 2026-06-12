import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { statusEnum } from '../enums'
import { companies } from './company'
import { defaultId, softDelete, timestamps } from './helpers'

// ---------------------------------------------------------------------------
// Category (self-referential hierarchy)
// ---------------------------------------------------------------------------
export const categories = pgTable(
  'categories',
  {
    id: defaultId,
    companyId: uuid('company_id').references(() => companies.id),
    parentId: uuid('parent_id'),
    group: text('group').notNull().default(''),
    name: text('name').notNull().default(''),
    status: statusEnum('status').notNull().default('active'),
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    index('categories_company_id_deleted_at_idx').on(t.companyId, t.deletedAt),
    index('categories_status_idx').on(t.status),
  ],
)
