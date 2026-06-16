import { PaginationMetadata, PaginationQuery } from './pagination.entity'
import { BaseEntity } from './timestamp.entity'

export type CompanyStatus = 'active' | 'inactive'

export const CompanyStatuses: CompanyStatus[] = ['active', 'inactive']

export interface CreateCompanyReq {
  name: string
  status?: CompanyStatus
}

export interface UpdateCompanyReq {
  id: string
  name?: string
  status?: CompanyStatus
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
  status: CompanyStatus
}

export interface CompanyList {
  items: Company[]
  pagination: PaginationMetadata
}
