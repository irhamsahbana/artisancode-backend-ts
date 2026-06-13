import { index, integer, pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { statusEnum } from '../enums'
import { defaultId, softDelete, timestamps } from './helpers'

// ---------------------------------------------------------------------------
// Branch
// ---------------------------------------------------------------------------
export const branches = pgTable(
  'branches',
  {
    id: defaultId,
    companyId: uuid('company_id').notNull(),
    name: text('name').notNull().default(''),
    city: text('city').notNull().default(''),
    capacity: integer('capacity').notNull().default(0),
    description: text('description').notNull().default(''),
    address: text('address').notNull().default(''),
    phone: text('phone').notNull().default(''),
    email: text('email').notNull().default(''),
    headCoach: text('head_coach').notNull().default(''),
    status: statusEnum('status').notNull().default('active'),
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    index('branches_company_id_deleted_at_idx').on(t.companyId, t.deletedAt),
    index('branches_status_idx').on(t.status),
  ],
)
