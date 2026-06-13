import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core'

import { products } from './product'

// ---------------------------------------------------------------------------
// TeacherProduct (composite PK)
// ---------------------------------------------------------------------------
export const teacherProducts = pgTable(
  'teacher_products',
  {
    teacherId: uuid('teacher_id').notNull(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.teacherId, t.productId] })],
)
