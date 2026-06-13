import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { billingCycleEnum, enrollmentStatusEnum } from '../enums'
import { defaultId, softDelete, timestamps } from './helpers'

// ---------------------------------------------------------------------------
// Enrollment
// ---------------------------------------------------------------------------
export const enrollments = pgTable(
  'enrollments',
  {
    id: defaultId,
    companyId: uuid('company_id').notNull(),
    branchId: uuid('branch_id').notNull(),
    studentId: uuid('student_id').notNull(),
    productId: uuid('product_id').notNull(),
    productPricingId: uuid('product_pricing_id').notNull(),
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
