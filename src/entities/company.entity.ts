import { PaginationMetadata, PaginationQuery } from './pagination.entity'
import { BaseEntity } from './timestamp.entity'

export interface CreateCompanyReq {
  name: string
  status?: 'active' | 'inactive'
}

export interface UpdateCompanyReq {
  id: string
  name?: string
  status?: 'active' | 'inactive'
  accessible_company_id?: string
}

export interface GetCompanyReq {
  id?: string
  ids?: string[]
  q?: string
  pagination?: PaginationQuery
  accessible_company_id?: string
}

export interface Company extends BaseEntity {
  id: string
  name: string
  status: 'active' | 'inactive'
}

export interface CompanyList {
  items: Company[]
  pagination: PaginationMetadata
}
