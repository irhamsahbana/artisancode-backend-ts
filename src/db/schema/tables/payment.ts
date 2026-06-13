import { decimal, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { defaultId, softDelete, timestamps } from './helpers'
import { invoices } from './invoice'

// ---------------------------------------------------------------------------
// Payment
// ---------------------------------------------------------------------------
export const payments = pgTable(
  'payments',
  {
    id: defaultId,
    companyId: uuid('company_id').notNull(),
    branchId: uuid('branch_id').notNull(),
    invoiceId: uuid('invoice_id')
      .notNull()
      .references(() => invoices.id),
    amount: decimal('amount').notNull().default('0'),
    method: text('method').notNull(),
    paymentDate: timestamp('payment_date', { withTimezone: true }).notNull(),
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    index('payments_company_id_deleted_at_idx').on(t.companyId, t.deletedAt),
    index('payments_invoice_id_idx').on(t.invoiceId),
  ],
)
