import { PaginationMetadata, PaginationQuery } from './pagination.entity'

export type CategoryStatus = 'active' | 'inactive'

export const CategoryStatuses: CategoryStatus[] = ['active', 'inactive']

export interface Category {
  id: string
  company_id: string
  parent_id: string | null
  group: string
  name: string
  status: CategoryStatus
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
}

export interface CreateCategoryReq {
  company_id: string
  parent_id?: string
  group?: string
  name: string
  status?: string
}

export interface UpdateCategoryReq {
  id: string
  company_id: string
  parent_id?: string
  group?: string
  name?: string
  status?: string
}

export interface GetCategoryReq {
  id?: string
  company_id: string
  q?: string
  group?: string
  pagination?: PaginationQuery
}

export interface CategoryList {
  items: Category[]
  pagination: PaginationMetadata
}
