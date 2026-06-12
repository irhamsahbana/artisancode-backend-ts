import { pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { defaultId, timestamps } from './helpers'
import { products } from './product'

// ---------------------------------------------------------------------------
// ProductSchedule
// ---------------------------------------------------------------------------
export const productSchedules = pgTable('product_schedules', {
  id: defaultId,
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  day: text('day').notNull().default(''),
  startTime: text('start_time').notNull().default(''),
  endTime: text('end_time').notNull().default(''),
  ...timestamps,
})
