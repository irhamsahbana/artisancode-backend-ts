import { PaginationMetadata, PaginationQuery } from './pagination.entity'
import { Program, ProgramPricing } from './program.entity'
import { Student } from './student.entity'

export interface Enrollment {
  id: string
  company_id: string
  branch_id: string
  student_id: string
  program_id: string
  pricing_id: string
  status: string
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
  student?: Student
  program?: Program
  pricing?: ProgramPricing
}

export interface CreateEnrollmentReq {
  company_id: string
  branch_id: string
  student_id: string
  program_id: string
  pricing_id: string
  status?: string
}

export interface UpdateEnrollmentReq {
  id: string
  company_id: string
  branch_id?: string
  student_id?: string
  program_id?: string
  pricing_id?: string
  status?: string
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
