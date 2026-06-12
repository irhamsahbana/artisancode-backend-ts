import { index, json, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { branches } from './branch'
import { companies } from './company'
import { users } from './user'

// ---------------------------------------------------------------------------
// ActivityLog
// ---------------------------------------------------------------------------
export const activityLogs = pgTable(
  'activity_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id),
    branchId: uuid('branch_id').references(() => branches.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
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
