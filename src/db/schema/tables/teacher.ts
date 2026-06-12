import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { employeeStatusEnum } from '../enums'
import { branches } from './branch'
import { companies } from './company'
import { defaultId, softDelete, timestamps } from './helpers'

// ---------------------------------------------------------------------------
// Teacher
// ---------------------------------------------------------------------------
export const teachers = pgTable(
  'teachers',
  {
    id: defaultId,
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id),
    branchId: uuid('branch_id').references(() => branches.id),
    status: employeeStatusEnum('status').notNull().default('active'),
    name: text('name').notNull().default(''),
    email: text('email').notNull().unique().default(''),
    phone: text('phone').notNull().default(''),
    specialty: text('specialty').notNull().default(''),
    address: text('address').notNull().default(''),
    birthDate: text('birth_date').notNull().default(''),
    biography: text('biography').notNull().default(''),
    ...timestamps,
    ...softDelete,
  },
  (t) => [index('teachers_company_id_deleted_at_idx').on(t.companyId, t.deletedAt)],
)
