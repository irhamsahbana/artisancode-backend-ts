import { index, pgTable, text } from 'drizzle-orm/pg-core'

import { defaultId, softDelete, timestamps } from './helpers'

// ---------------------------------------------------------------------------
// Permission
// ---------------------------------------------------------------------------
export const permissions = pgTable(
  'permissions',
  {
    id: defaultId,
    name: text('name').notNull().unique(),
    description: text('description').notNull().default(''),
    ...timestamps,
    ...softDelete,
  },
  (t) => [index('permissions_deleted_at_idx').on(t.deletedAt)],
)
