import { PaginationMetadata, PaginationQuery } from './pagination.entity'

export interface Program {
  id: string
  company_id: string
  branch_id: string | null
  age_category_id: string | null
  name: string
  description: string
  capacity: number
  duration: string
  start_date: Date
  end_date: Date | null
  status: string
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
}

export interface CreateProgramReq {
  company_id: string
  branch_id?: string
  age_category_id?: string
  name: string
  description?: string
  capacity?: number
  duration?: string
  start_date?: Date
  end_date?: Date
  status?: string
}

export interface UpdateProgramReq {
  id: string
  company_id: string
  branch_id?: string
  age_category_id?: string
  name?: string
  description?: string
  capacity?: number
  duration?: string
  start_date?: Date
  end_date?: Date
  status?: string
}

export interface GetProgramReq {
  id?: string
  company_id: string
  branch_id?: string
  q?: string
  pagination?: PaginationQuery
}

export interface ProgramList {
  items: Program[]
  pagination: PaginationMetadata
}
