import { boolean, index, pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { defaultId, softDelete, timestamps } from './helpers'
import { products } from './product'

// ---------------------------------------------------------------------------
// ProductPricing
// ---------------------------------------------------------------------------
export const productPricings = pgTable(
  'product_pricings',
  {
    id: defaultId,
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id),
    name: text('name').notNull().default(''),
    description: text('description').notNull().default(''),
    isActive: boolean('is_active').notNull().default(true),
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    index('product_pricings_product_id_name_deleted_at_idx').on(t.productId, t.name, t.deletedAt),
  ],
)
