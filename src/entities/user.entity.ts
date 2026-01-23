import { PaginationMetadata, PaginationQuery } from './pagination.entity'
import { BaseEntity } from './timestamp.entity'

export type UserStatus = 'active' | 'inactive'

export const UserStatuses: UserStatus[] = ['active', 'inactive']

export interface UserContext {
  id: string
  company_id: string
  branch_id?: string
  role_id: string
  name: string
  username: string
}

export interface CreateUserReq {
  name: string
  username: string
  email: string
  password: string
  phone: string
  company_id: string
  role_id: string
  status?: UserStatus
  user?: UserContext
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
  status?: UserStatus
  user?: UserContext
}

export interface GetUserReq {
  id?: string
  username?: string
  company_id?: string
  pagination?: PaginationQuery
  user?: UserContext
}

export interface User extends BaseEntity {
  id: string
  companyId: string
  roleId: string
  name: string
  username: string
  email: string
  phone: string
  status: UserStatus
}

export interface UserList {
  items: User[]
  pagination: PaginationMetadata
}

export interface LoginRes extends User {
  token: string
}

export interface RegisterReq {
  company_name: string
  name: string
  username: string
  email: string
  password: string
  phone: string
}

export interface RegisterRes {
  company: {
    id: string
    name: string
  }
  user: {
    id: string
    username: string
    email: string
  }
}
