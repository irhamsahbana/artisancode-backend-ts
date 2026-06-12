import { uuid, timestamp } from 'drizzle-orm/pg-core'

// ---------------------------------------------------------------------------
// Reusable column helpers for all tables
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// default ID (UUIDv4 fallback, app layer should generate UUIDv7)
// ---------------------------------------------------------------------------
export const defaultId = uuid('id').primaryKey().defaultRandom()

export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}

export const softDelete = {
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}
