import { pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { statusEnum } from '../enums'
import { branches } from './branch'
import { companies } from './company'
import { defaultId, softDelete, timestamps } from './helpers'
import { roles } from './role'

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------
export const users = pgTable('users', {
  id: defaultId,
  companyId: uuid('company_id')
    .notNull()
    .references(() => companies.id),
  branchId: uuid('branch_id').references(() => branches.id),
  roleId: uuid('role_id')
    .notNull()
    .references(() => roles.id),
  name: text('name').notNull().default(''),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  phone: text('phone').notNull().default(''),
  status: statusEnum('status').notNull().default('active'),
  ...timestamps,
  ...softDelete,
})
