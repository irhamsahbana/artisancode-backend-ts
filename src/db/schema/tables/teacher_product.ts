import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core'

import { products } from './product'
import { teachers } from './teacher'

// ---------------------------------------------------------------------------
// TeacherProduct (composite PK)
// ---------------------------------------------------------------------------
export const teacherProducts = pgTable(
  'teacher_products',
  {
    teacherId: uuid('teacher_id')
      .notNull()
      .references(() => teachers.id),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.teacherId, t.productId] })],
)
