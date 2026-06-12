import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { billingCycleEnum, enrollmentStatusEnum } from '../enums'
import { branches } from './branch'
import { companies } from './company'
import { defaultId, softDelete, timestamps } from './helpers'
import { products } from './product'
import { productPricings } from './product_pricing'
import { students } from './student'

// ---------------------------------------------------------------------------
// Enrollment
// ---------------------------------------------------------------------------
export const enrollments = pgTable(
  'enrollments',
  {
    id: defaultId,
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id),
    branchId: uuid('branch_id')
      .notNull()
      .references(() => branches.id),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id),
    productPricingId: uuid('product_pricing_id')
      .notNull()
      .references(() => productPricings.id),
    currency: text('currency').notNull().default('IDR'),
    billingCycle: billingCycleEnum('billing_cycle').notNull().default('monthly'),
    nextBillingDate: timestamp('next_billing_date', { withTimezone: true }),
    autoRenew: boolean('auto_renew').notNull().default(true),
    status: enrollmentStatusEnum('status').notNull().default('active'),
    ...timestamps,
    ...softDelete,
  },
  (t) => [index('enrollments_company_id_deleted_at_idx').on(t.companyId, t.deletedAt)],
)
