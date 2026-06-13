import { decimal, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { invoiceStatusEnum } from '../enums'
import { enrollments } from './enrollment'
import { defaultId } from './helpers'

// ---------------------------------------------------------------------------
// Invoice
// ---------------------------------------------------------------------------
export const invoices = pgTable(
  'invoices',
  {
    id: defaultId,
    companyId: uuid('company_id').notNull(),
    branchId: uuid('branch_id').notNull(),
    enrollmentId: uuid('enrollment_id')
      .notNull()
      .references(() => enrollments.id),
    invoiceNumber: text('invoice_number').notNull().unique(),
    invoiceDate: timestamp('invoice_date', { withTimezone: true }).notNull(),
    issuedDate: timestamp('issued_date', { withTimezone: true }).notNull().defaultNow(),
    dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
    amount: decimal('amount').notNull().default('0'),
    currency: text('currency').notNull().default('IDR'),
    status: invoiceStatusEnum('status').notNull(),
    dokuInvoiceId: text('doku_invoice_id'),
    dokuRequestId: text('doku_request_id'),
    paymentUrl: text('payment_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    index('invoices_company_id_deleted_at_idx').on(t.companyId, t.deletedAt),
    index('invoices_enrollment_id_idx').on(t.enrollmentId),
    index('invoices_status_idx').on(t.status),
    index('invoices_invoice_date_idx').on(t.invoiceDate),
  ],
)
