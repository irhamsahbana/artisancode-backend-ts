import { PaginationMetadata, PaginationQuery } from './pagination.entity'

export interface ActivityLog {
  id: string
  company_id: string
  branch_id: string | null
  user_id: string
  entity_name: string
  entity_id: string
  activity: string
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  created_at: Date
  deleted_at: Date | null
}

export interface CreateActivityLogReq {
  company_id: string
  branch_id?: string
  user_id: string
  entity_name: string
  entity_id: string
  activity: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
}

export interface GetActivityLogReq {
  id?: string
  company_id: string
  branch_id?: string
  user_id?: string
  entity_name?: string
  q?: string
  pagination?: PaginationQuery
}

export interface ActivityLogList {
  items: ActivityLog[]
  pagination: PaginationMetadata
}
