import { AppError } from '@/common/app_error'
import {
  ActiveInvoiceStatuses,
  CreateInvoiceReq,
  GetInvoiceReq,
  Invoice,
  InvoiceList,
  InvoiceStatus,
} from '@/entities/invoice.entity'
import { DokuCheckStatusRes, DokuProvider } from '@/providers/doku'
import { withSpan } from '@/telemetry'

import { IInvoiceRepo, IInvoiceUsecase } from './invoice.contract'

export default class InvoiceUsecase implements IInvoiceUsecase {
  constructor(
    private repo: IInvoiceRepo,
    private dokuProvider: DokuProvider,
  ) {}

  async create(data: CreateInvoiceReq): Promise<Invoice> {
    return withSpan('invoice.usecase', 'InvoiceUsecase.create', async () => {
      const invoice = await this.repo.create(data)
      return invoice
    })
  }

  async findById(id: string, company_id: string): Promise<Invoice> {
    return withSpan('invoice.usecase', 'InvoiceUsecase.findById', async () => {
      const invoice = await this.repo.findById(id, company_id)
      if (!invoice) throw new AppError(404, 'Invoice not found')
      return invoice
    })
  }

  async findList(req: GetInvoiceReq): Promise<InvoiceList> {
    return withSpan('invoice.usecase', 'InvoiceUsecase.findList', async () => {
      return this.repo.findList(req)
    })
  }

  async updateStatus(id: string, company_id: string, status: string): Promise<Invoice> {
    return withSpan('invoice.usecase', 'InvoiceUsecase.updateStatus', async () => {
      const invoice = await this.repo.findById(id, company_id)
      if (!invoice) throw new AppError(404, 'Invoice not found')

      return this.repo.update({
        id,
        company_id,
        status,
      })
    })
  }

  async generatePaymentLink(id: string, company_id: string): Promise<Invoice> {
    return withSpan('invoice.usecase', 'InvoiceUsecase.generatePaymentLink', async () => {
      const invoice = await this.repo.findById(id, company_id)
      if (!invoice) throw new AppError(404, 'Invoice not found')

      if (invoice.status === 'paid') {
        throw new AppError(400, 'Invoice is already paid')
      }

      if (invoice.payment_url) {
        let statusPayload: DokuCheckStatusRes
        try {
          statusPayload = await this.dokuProvider.checkStatus(invoice.invoice_number)
        } catch (error) {
          throw new AppError(502, 'DOKU status check failed', error)
        }
        const resolvedStatus = await this.resolveDokuStatus(statusPayload)

        if (!resolvedStatus) {
          throw new AppError(502, 'DOKU status is not recognized', statusPayload)
        }

        if (resolvedStatus === 'paid') {
          return this.repo.update({
            id,
            company_id,
            status: 'paid',
            paid_at: new Date(),
          })
        }

        if (resolvedStatus === 'pending') {
          if (!ActiveInvoiceStatuses.includes(invoice.status as InvoiceStatus)) {
            return this.repo.update({
              id,
              company_id,
              status: 'pending',
            })
          }
          return invoice
        }

        if (resolvedStatus === 'cancelled') {
          return this.repo.update({
            id,
            company_id,
            status: 'cancelled',
          })
        }

        await this.repo.update({
          id,
          company_id,
          status: resolvedStatus,
        })
      }

      const paymentLink = await this.dokuProvider.generatePaymentLink({
        invoice_number: invoice.invoice_number,
        amount: invoice.amount,
        customer_email:
          invoice.enrollment?.student?.parent_email || invoice.enrollment?.student?.email || '',
        customer_name: invoice.enrollment?.student
          ? `${invoice.enrollment.student.first_name} ${invoice.enrollment.student.last_name}`
          : 'Customer',
        customer_phone: invoice.enrollment?.student?.parent_phone,
        customer_address: invoice.enrollment?.student?.address,
        line_items: [
          {
            name: `${invoice.enrollment?.program?.name || 'Tuition Fee'} - ${invoice.enrollment?.pricing?.name || ''}`,
            price: invoice.amount,
            quantity: 1,
          },
        ],
      })

      return this.repo.update({
        id,
        company_id,
        status: 'pending',
        doku_invoice_id: paymentLink.invoice_id,
        payment_url: paymentLink.payment_url,
      })
    })
  }

  async findActiveByEnrollment(enrollment_id: string, company_id: string): Promise<Invoice | null> {
    return withSpan('invoice.usecase', 'InvoiceUsecase.findActiveByEnrollment', async () => {
      return this.repo.findActiveByEnrollment(enrollment_id, company_id)
    })
  }

  private async resolveDokuStatus(payload: DokuCheckStatusRes): Promise<InvoiceStatus | null> {
    return withSpan('invoice.usecase', 'InvoiceUsecase.resolveDokuStatus', async () => {
      const transactionStatus = String(payload.transaction?.status ?? '').toUpperCase()
      const orderStatus = String(payload.order?.status ?? '').toUpperCase()

      if (transactionStatus === 'SUCCESS') return 'paid'
      if (transactionStatus === 'PENDING') return 'pending'
      if (transactionStatus === 'FAILED') return 'failed'
      if (transactionStatus === 'EXPIRED') return 'expired'
      if (transactionStatus === 'TIMEOUT') return 'pending'
      if (transactionStatus === 'REDIRECT') return 'pending'
      if (transactionStatus === 'REFUNDED') return 'cancelled'
      if (orderStatus === 'ORDER_EXPIRED') return 'expired'
      if (orderStatus === 'ORDER_GENERATED') return 'pending'

      return null
    })
  }
}
