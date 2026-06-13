import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { studentStatusEnum } from '../enums'
import { defaultId, softDelete, timestamps } from './helpers'

// ---------------------------------------------------------------------------
// Student
// ---------------------------------------------------------------------------
export const students = pgTable(
  'students',
  {
    id: defaultId,
    companyId: uuid('company_id').notNull(),
    branchId: uuid('branch_id').notNull(),
    firstName: text('first_name').notNull().default(''),
    lastName: text('last_name').notNull().default(''),
    gender: text('gender').notNull().default(''),
    dateOfBirth: timestamp('date_of_birth', { withTimezone: true }).notNull(),
    birthPlace: text('birth_place').notNull().default(''),
    email: text('email').notNull().default(''),
    address: text('address').notNull().default(''),
    photoUrl: text('photo_url').notNull().default(''),
    parentName: text('parent_name').notNull().default(''),
    parentPhone: text('parent_phone').notNull().default(''),
    parentEmail: text('parent_email').notNull().default(''),
    emergencyContactPhone: text('emergency_contact_phone').notNull().default(''),
    bloodType: text('blood_type').notNull().default(''),
    medicalNotes: text('medical_notes').notNull().default(''),
    status: studentStatusEnum('status').notNull().default('active'),
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    index('students_company_id_deleted_at_idx').on(t.companyId, t.deletedAt),
    index('students_status_idx').on(t.status),
  ],
)
