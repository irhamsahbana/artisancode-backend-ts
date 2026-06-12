import { index, integer, pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { productStatusEnum } from '../enums'
import { branches } from './branch'
import { companies } from './company'
import { defaultId, softDelete, timestamps } from './helpers'

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------
export const products = pgTable(
  'products',
  {
    id: defaultId,
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id),
    branchId: uuid('branch_id').references(() => branches.id),
    name: text('name').notNull().default(''),
    description: text('description').notNull().default(''),
    capacity: integer('capacity').default(0),
    status: productStatusEnum('status').notNull().default('active'),
    ...timestamps,
    ...softDelete,
  },
  (t) => [index('products_company_id_deleted_at_idx').on(t.companyId, t.deletedAt)],
)
