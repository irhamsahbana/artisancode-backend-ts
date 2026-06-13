import { index, json, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

// ---------------------------------------------------------------------------
// ActivityLog
// ---------------------------------------------------------------------------
export const activityLogs = pgTable(
  'activity_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id').notNull(),
    branchId: uuid('branch_id'),
    userId: uuid('user_id').notNull(),
    entityName: text('entity_name').notNull().default(''),
    entityId: text('entity_id').notNull().default(''),
    activity: text('activity').notNull().default(''),
    before: json('before'),
    after: json('after'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    index('activity_logs_company_id_deleted_at_idx').on(t.companyId, t.deletedAt),
    index('activity_logs_user_id_idx').on(t.userId),
  ],
)
