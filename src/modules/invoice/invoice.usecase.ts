import { IInvoiceRepo, IInvoiceUsecase } from './invoice.contract'
import { AppError } from '../../common/app_error'
import {
  CreateInvoiceReq,
  GetInvoiceReq,
  Invoice,
  InvoiceList,
} from '../../entities/invoice.entity'
import { DokuProvider } from '../../providers/doku'

export class InvoiceUsecase implements IInvoiceUsecase {

  constructor(
    private repo: IInvoiceRepo,
    private dokuProvider: DokuProvider,
  ) {}

  async create(data: CreateInvoiceReq): Promise<Invoice> {
    const invoice = await this.repo.create(data)

    // Optionally generate payment link immediately if needed
    // But usually this is explicit action.
    // However, user story says: "As an Admin, I want to check a box "Send Invoice Now" during enrollment"
    // So if the caller requests it, we can do it here.
    // For now, basic create.

    return invoice
  }

  async getOne(id: string, company_id: string): Promise<Invoice> {
    const invoice = await this.repo.findById(id, company_id)
    if (!invoice) throw new AppError(404, 'Invoice not found')
    return invoice
  }

  async getAll(req: GetInvoiceReq): Promise<InvoiceList> {
    return this.repo.findAll(req)
  }

  async updateStatus(id: string, company_id: string, status: string): Promise<Invoice> {
    const invoice = await this.repo.findById(id, company_id)
    if (!invoice) throw new AppError(404, 'Invoice not found')

    return this.repo.update({
      id,
      company_id,
      status,
    })
  }

  async generatePaymentLink(id: string, company_id: string): Promise<Invoice> {
    const invoice = await this.repo.findById(id, company_id)
    if (!invoice) throw new AppError(404, 'Invoice not found')

    if (invoice.status === 'paid') {
      throw new AppError(400, 'Invoice is already paid')
    }

    // Generate DOKU Link
    const paymentLink = await this.dokuProvider.generatePaymentLink({
      invoice_number: invoice.invoice_number,
      amount: invoice.amount,
      customer_email: invoice.enrollment?.student?.email || 'customer@example.com',
      customer_name: invoice.enrollment?.student
        ? `${invoice.enrollment.student.first_name} ${invoice.enrollment.student.last_name}`
        : 'Customer',
    })

    // Update Invoice with Payment Link
    return this.repo.update({
      id,
      company_id,
      doku_invoice_id: paymentLink.invoice_id,
      payment_url: paymentLink.payment_url,
    })
  }
}
