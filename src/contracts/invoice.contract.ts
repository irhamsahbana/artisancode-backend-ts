import {
  CreateInvoiceReq,
  GetInvoiceReq,
  Invoice,
  InvoiceList,
  UpdateInvoiceReq,
} from '@/entities/invoice.entity'

export interface IInvoiceRepo {
  create(data: CreateInvoiceReq): Promise<Invoice>
  findById(id: string, company_id: string): Promise<Invoice | null>
  findList(req: GetInvoiceReq): Promise<InvoiceList>
  update(data: UpdateInvoiceReq): Promise<Invoice>
  findByInvoiceNumber(invoiceNumber: string, company_id: string): Promise<Invoice | null>
  findActiveByEnrollment(enrollment_id: string, company_id: string): Promise<Invoice | null>
}

export interface IInvoiceUsecase {
  create(data: CreateInvoiceReq): Promise<Invoice>
  findById(id: string, company_id: string): Promise<Invoice>
  findList(req: GetInvoiceReq): Promise<InvoiceList>
  updateStatus(id: string, company_id: string, status: string): Promise<Invoice>
  generatePaymentLink(id: string, company_id: string): Promise<Invoice>
  findActiveByEnrollment(enrollment_id: string, company_id: string): Promise<Invoice | null>
}
