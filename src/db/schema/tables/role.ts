import { index, pgTable, text, unique, uuid } from 'drizzle-orm/pg-core'

import { companies } from './company'
import { defaultId, softDelete, timestamps } from './helpers'

// ---------------------------------------------------------------------------
// Role
// ---------------------------------------------------------------------------
export const roles = pgTable(
  'roles',
  {
    id: defaultId,
    companyId: uuid('company_id').references(() => companies.id),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    index('roles_company_id_deleted_at_idx').on(t.companyId, t.deletedAt),
    unique('roles_company_id_name_unique').on(t.companyId, t.name),
  ],
)
