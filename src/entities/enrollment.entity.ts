import { Branch } from './branch.entity'
import { PaginationMetadata, PaginationQuery } from './pagination.entity'
import { Program, ProgramPricing } from './program.entity'
import { Student } from './student.entity'
import { Teacher } from './teacher.entity'

export interface Enrollment {
  id: string
  company_id: string
  branch_id: string
  student_id: string
  program_id: string
  pricing_id: string
  enrollment_date?: Date
  status: string
  billing_type?: string
  billed_at?: number
  next_payment_date?: Date | null
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
  student?: Student
  program?: Program & {
    branch?: Branch
    teachers?: Teacher[]
  }
  pricing?: ProgramPricing
}

export interface CreateEnrollmentReq {
  company_id: string
  branch_id: string
  student_id: string
  program_id: string
  pricing_id: string
  enrollment_date?: Date
  status?: string
  billing_type?: string
  billed_at?: number
  next_payment_date?: Date
}

export interface UpdateEnrollmentReq {
  id: string
  company_id: string
  branch_id?: string
  student_id?: string
  program_id?: string
  pricing_id?: string
  enrollment_date?: Date
  status?: string
  billing_type?: string
  billed_at?: number
  next_payment_date?: Date
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
