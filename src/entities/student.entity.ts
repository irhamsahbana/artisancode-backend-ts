import { PaginationMetadata, PaginationQuery } from './pagination.entity'

export type StudentStatus =
  | 'active'
  | 'inactive'
  | 'graduated'
  | 'suspended'
  | 'dropped'
  | 'pending'
  | 'on_leave'

export const StudentStatuses: StudentStatus[] = [
  'active',
  'inactive',
  'graduated',
  'suspended',
  'dropped',
  'pending',
  'on_leave',
]

export const InactiveStudentStatuses: StudentStatus[] = ['suspended', 'dropped', 'inactive']

export interface Student {
  id: string
  company_id: string
  branch_id: string
  first_name: string
  last_name: string
  gender: string
  date_of_birth: Date
  birth_place: string
  email: string
  address: string
  photo_url: string
  parent_name: string
  parent_phone: string
  parent_email: string
  emergency_contact_phone: string
  blood_type: string
  medical_notes: string
  status: string
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
}

export interface CreateStudentReq {
  company_id: string
  branch_id: string
  first_name: string
  last_name: string
  gender: string
  date_of_birth: Date
  birth_place?: string
  email: string
  address?: string
  photo_url?: string
  parent_name?: string
  parent_phone?: string
  parent_email?: string
  emergency_contact_phone?: string
  blood_type?: string
  medical_notes?: string
  status?: string
}

export interface UpdateStudentReq {
  id: string
  company_id: string
  branch_id?: string
  first_name?: string
  last_name?: string
  gender?: string
  date_of_birth?: Date
  birth_place?: string
  email?: string
  address?: string
  photo_url?: string
  parent_name?: string
  parent_phone?: string
  parent_email?: string
  emergency_contact_phone?: string
  blood_type?: string
  medical_notes?: string
  status?: string
}

export interface GetStudentReq {
  id?: string
  company_id: string
  branch_id?: string
  age?: number
  q?: string
  pagination?: PaginationQuery
}

export interface StudentList {
  items: Student[]
  pagination: PaginationMetadata
}
