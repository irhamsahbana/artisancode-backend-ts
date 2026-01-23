import { PaginationMetadata, PaginationQuery } from './pagination.entity'
import { BaseEntity } from './timestamp.entity'
import { UserContext } from './user.entity'

export type CompanyStatus = 'active' | 'inactive'

export const CompanyStatuses: CompanyStatus[] = ['active', 'inactive']

export interface CreateCompanyReq {
  name: string
  status?: CompanyStatus
  user?: UserContext
}

export interface UpdateCompanyReq {
  id: string
  name?: string
  status?: CompanyStatus
  accessible_company_id?: string
  user?: UserContext
}

export interface GetCompanyReq {
  id?: string
  ids?: string[]
  q?: string
  pagination?: PaginationQuery
  accessible_company_id?: string
  user?: UserContext
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
