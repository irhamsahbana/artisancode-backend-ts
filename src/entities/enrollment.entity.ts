import { Branch } from './branch.entity'
import { Invoice } from './invoice.entity'
import { PaginationMetadata, PaginationQuery } from './pagination.entity'
import { Program, ProgramPricing } from './program.entity'
import { Student } from './student.entity'
import { Teacher } from './teacher.entity'

export type EnrollmentStatus = 'active' | 'inactive'

export const EnrollmentStatuses: EnrollmentStatus[] = ['active', 'inactive']

export interface Enrollment {
  id: string
  company_id: string
  branch_id: string
  student_id: string
  program_id: string
  pricing_id: string
  currency?: string
  enrollment_date?: Date
  status: EnrollmentStatus
  billing_cycle?: string
  next_billing_date?: Date | null
  auto_renew?: boolean
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
  student?: Student
  program?: Program & {
    branch?: Branch
    teachers?: Teacher[]
  }
  pricing?: ProgramPricing
  latest_invoice?: Invoice
  payment_proof_url?: string | null
}

export interface CreateEnrollmentReq {
  company_id: string
  branch_id: string
  student_id: string
  program_id: string
  pricing_id: string
  currency?: string
  enrollment_date?: Date
  status?: string
  billing_cycle?: string
  next_billing_date?: Date
  auto_renew?: boolean
  generate_invoice?: boolean
}

export interface UpdateEnrollmentReq {
  id: string
  company_id: string
  branch_id?: string
  student_id?: string
  program_id?: string
  pricing_id?: string
  currency?: string
  enrollment_date?: Date
  status?: string
  billing_cycle?: string
  next_billing_date?: Date
  auto_renew?: boolean
  payment_proof_url?: string
}

export interface GenerateEnrollmentInvoiceReq {
  id: string
  company_id: string
}

export interface GetEnrollmentReq {
  id?: string
  company_id: string
  branch_id?: string
  student_id?: string
  program_id?: string
  pricing_id?: string
  pagination?: PaginationQuery
}

export interface EnrollmentList {
  items: Enrollment[]
  pagination: PaginationMetadata
}
