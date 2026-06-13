import { pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { statusEnum } from '../enums'
import { defaultId, softDelete, timestamps } from './helpers'

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------
export const users = pgTable('users', {
  id: defaultId,
  companyId: uuid('company_id').notNull(),
  branchId: uuid('branch_id'),
  roleId: uuid('role_id').notNull(),
  name: text('name').notNull().default(''),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  phone: text('phone').notNull().default(''),
  status: statusEnum('status').notNull().default('active'),
  ...timestamps,
  ...softDelete,
})
