import { PaginationMetadata, PaginationQuery } from './pagination.entity'

export type ProgramStatus = 'active' | 'inactive' | 'archived'

export interface ProgramSchedule {
  id: string
  program_id: string
  day: string
  start_time: string
  end_time: string
  created_at: Date
  updated_at: Date
}

export interface ProgramPrice {
  id: string
  pricing_id: string
  currency: string
  price: number
  started_at: Date
  ended_at: Date | null
  is_active: boolean
  created_at: Date
}

export interface ProgramPricing {
  id: string
  program_id: string
  name: string
  description: string
  is_active: boolean
  prices: ProgramPrice[]
  created_at: Date
  updated_at: Date
}

export interface Program {
  id: string
  company_id: string
  branch_id: string | null
  name: string
  description: string
  status: ProgramStatus
  schedules?: ProgramSchedule[]
  pricings?: ProgramPricing[]
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
}

export interface CreateProgramReq {
  company_id: string
  branch_id?: string
  name: string
  description?: string
  status?: ProgramStatus
  schedules?: {
    day?: string
    start_time?: string
    end_time?: string
  }[]
  pricings?: {
    name: string
    description?: string
    prices: {
      currency: string
      price: number
      started_at?: Date
      ended_at?: Date
    }[]
  }[]
}

export interface UpdateProgramReq {
  id: string
  company_id: string
  branch_id?: string
  name?: string
  description?: string
  status?: ProgramStatus
}

export interface UpdateProgramAllReq {
  id: string
  company_id: string
  branch_id?: string | null
  name?: string
  description?: string
  status?: ProgramStatus
  schedules?: {
    id?: string | null
    day?: string
    start_time?: string
    end_time?: string
  }[]
  pricings?: {
    name: string
    description?: string
    prices: {
      currency: string
      price: number
      started_at?: Date
      ended_at?: Date
    }[]
  }[]
}

export interface UpdatePriceReq {
  program_id: string
  pricing_id: string
  price_id: string
  company_id: string
  price?: number
  started_at?: Date
  ended_at?: Date | null
}

export interface AddScheduleReq {
  program_id: string
  company_id: string
  day?: string
  start_time?: string
  end_time?: string
}

export interface AddPricingReq {
  program_id: string
  company_id: string
  name: string
  description?: string
  prices: {
    currency: string
    price: number
    started_at?: Date
    ended_at?: Date
  }[]
}

export interface AddPriceReq {
  program_id: string
  pricing_id: string
  company_id: string
  currency: string
  price: number
  started_at?: Date
  ended_at?: Date
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
