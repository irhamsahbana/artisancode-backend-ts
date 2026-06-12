import { decimal, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { defaultId, timestamps } from './helpers'
import { productPricings } from './product_pricing'

// ---------------------------------------------------------------------------
// ProductPrice
// ---------------------------------------------------------------------------
export const productPrices = pgTable(
  'product_prices',
  {
    id: defaultId,
    productPricingId: uuid('product_pricing_id')
      .notNull()
      .references(() => productPricings.id),
    price: decimal('price').notNull().default('0'),
    currency: text('currency').notNull().default('IDR'),
    ...timestamps,
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
  },
  (t) => [
    index('product_prices_pricing_id_started_at_ended_at_idx').on(
      t.productPricingId,
      t.startedAt,
      t.endedAt,
    ),
  ],
)
