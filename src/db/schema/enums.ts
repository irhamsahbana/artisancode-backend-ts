import { pgEnum } from 'drizzle-orm/pg-core'

export const statusEnum = pgEnum('status', ['active', 'inactive'])

export const billingTypeEnum = pgEnum('billing_type', ['one_time', 'recurring'])

export const billingIntervalEnum = pgEnum('billing_interval', ['day', 'week', 'month', 'year'])

export const employeeStatusEnum = pgEnum('employee_status', [
  'active',
  'inactive',
  'on_leave',
  'terminated',
])

export const enrollmentStatusEnum = pgEnum('enrollment_status', ['active', 'inactive'])

export const productStatusEnum = pgEnum('product_status', ['active', 'inactive', 'archived'])

export const studentStatusEnum = pgEnum('student_status', [
  'active',
  'inactive',
  'graduated',
  'suspended',
  'dropped',
  'pending',
  'on_leave',
])

export const pricingTypeEnum = pgEnum('pricing_type', [
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'custom',
])

export const paymentModeEnum = pgEnum('payment_mode', ['pay_now', 'pay_later'])

export const invoiceStatusEnum = pgEnum('invoice_status', [
  'draft',
  'unpaid',
  'paid',
  'overdue',
  'pending',
  'expired',
  'failed',
  'cancelled',
])

export const billingCycleEnum = pgEnum('billing_cycle', [
  'monthly',
  'quarterly',
  'annually',
  'one_time',
])

export const fileStatusEnum = pgEnum('file_status', [
  'pending',
  'attached',
  'deleted',
  'failed',
])
