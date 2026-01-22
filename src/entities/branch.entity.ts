import { PaginationMetadata, PaginationQuery } from './pagination.entity'

export type BranchStatus =
  | 'active'
  | 'inactive'
  | 'under_construction'
  | 'temporarily_closed'
  | 'planning'

export const BranchStatuses: BranchStatus[] = [
  'active',
  'inactive',
  'under_construction',
  'temporarily_closed',
  'planning',
]

export interface Branch {
  id: string
  company_id: string
  name: string
  city: string
  capacity: number
  description: string
  address: string
  phone: string
  email: string
  head_coach: string
  status: string
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
}

export interface CreateBranchReq {
  company_id: string
  name: string
  city: string
  capacity?: number
  description?: string
  address?: string
  phone?: string
  email?: string
  head_coach?: string
  status?: string
}

export interface UpdateBranchReq {
  id: string
  company_id: string // for security check
  name?: string
  city?: string
  capacity?: number
  description?: string
  address?: string
  phone?: string
  email?: string
  head_coach?: string
  status?: string
}

export interface GetBranchReq {
  id?: string
  company_id: string
  q?: string
  pagination?: PaginationQuery
}

export interface BranchList {
  items: Branch[]
  pagination: PaginationMetadata
}
