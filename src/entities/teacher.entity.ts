import { PaginationMetadata, PaginationQuery } from './pagination.entity'

export type TeacherStatus = 'active' | 'inactive' | 'on_leave' | 'terminated'

export const TeacherStatuses: TeacherStatus[] = ['active', 'inactive', 'on_leave', 'terminated']

export interface Teacher {
  id: string
  company_id: string
  branch?: {
    id: string
    name: string
  }
  status: TeacherStatus
  name: string
  email: string
  phone: string
  address: string
  birth_date: string
  biography: string
  specialty: string
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
}

export interface CreateTeacherReq {
  id?: string
  company_id: string
  branch_id?: string
  status?: TeacherStatus
  name: string
  email: string
  phone?: string
  address?: string
  birth_date?: string
  biography?: string
  specialty?: string
}

export interface UpdateTeacherReq {
  id: string
  company_id: string
  branch_id?: string
  status?: TeacherStatus
  name?: string
  email?: string
  phone?: string
  address?: string
  birth_date?: string
  biography?: string
  specialty?: string
}

export interface GetTeacherReq {
  id?: string
  company_id: string
  branch_id?: string
  q?: string
  pagination?: PaginationQuery
}

export interface TeacherList {
  items: Teacher[]
  pagination: PaginationMetadata
}
