import { PaginationMetadata, PaginationQuery } from './pagination.entity'
import { BaseEntity } from './timestamp.entity'

export interface CreateUserReq {
  name: string
  username: string
  email: string
  password: string
  phone: string
  company_id: string
  role_id: string
  status?: 'active' | 'inactive'
}

export interface LoginReq {
  username: string
  password: string
}

export interface UpdateUserReq {
  id: string
  name?: string
  email?: string
  phone?: string
  role_id?: string
  status?: 'active' | 'inactive'
}

export interface GetUserReq {
  id?: string
  username?: string
  company_id?: string
  pagination?: PaginationQuery
}

export interface User extends BaseEntity {
  id: string
  companyId: string
  roleId: string
  name: string
  username: string
  email: string
  phone: string
  status: string
}

export interface UserList {
  items: User[]
  pagination: PaginationMetadata
}

export interface LoginRes extends User {
  token: string
}
