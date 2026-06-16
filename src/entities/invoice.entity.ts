import { Branch } from './branch.entity'
import { Company } from './company.entity'
import { Enrollment } from './enrollment.entity'
import { PaginationMetadata, PaginationQuery } from './pagination.entity'

export type InvoiceStatus =
  | 'draft'
  | 'unpaid'
  | 'paid'
  | 'overdue'
  | 'pending'
  | 'expired'
  | 'failed'
  | 'cancelled'

export const InvoiceStatuses: InvoiceStatus[] = [
  'draft',
  'unpaid',
  'paid',
  'overdue',
  'pending',
  'expired',
  'failed',
  'cancelled',
]

export const ActiveInvoiceStatuses: InvoiceStatus[] = ['draft', 'unpaid', 'overdue', 'pending']

export interface Invoice {
  id: string
  company_id: string
  branch_id: string
  enrollment_id: string
  invoice_number: string
  issued_date: Date
  due_date: Date
  amount: number
  currency: string
  status: InvoiceStatus
  doku_invoice_id?: string | null
  doku_request_id?: string | null
  payment_url?: string | null
  paid_at?: Date | null
  created_at: Date
  updated_at?: Date
  deleted_at?: Date | null

  enrollment?: Enrollment
  company?: Company
  branch?: Branch
}

export interface CreateInvoiceReq {
  company_id: string
  branch_id: string
  enrollment_id: string
  amount: number
  currency?: string
  due_date: Date
  issued_date?: Date
  status?: string
}

export interface UpdateInvoiceReq {
  id: string
  company_id: string
  status?: string
  paid_at?: Date
  doku_invoice_id?: string
  doku_request_id?: string
  payment_url?: string
}

export interface GetInvoiceReq {
  id?: string
  company_id: string
  enrollment_id?: string
  status?: string
  pagination?: PaginationQuery
}

export interface InvoiceList {
  items: Invoice[]
  pagination: PaginationMetadata
}
