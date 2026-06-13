import { index, integer, pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { productStatusEnum } from '../enums'
import { defaultId, softDelete, timestamps } from './helpers'

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------
export const products = pgTable(
  'products',
  {
    id: defaultId,
    companyId: uuid('company_id').notNull(),
    branchId: uuid('branch_id'),
    name: text('name').notNull().default(''),
    description: text('description').notNull().default(''),
    capacity: integer('capacity').default(0),
    status: productStatusEnum('status').notNull().default('active'),
    ...timestamps,
    ...softDelete,
  },
  (t) => [index('products_company_id_deleted_at_idx').on(t.companyId, t.deletedAt)],
)
