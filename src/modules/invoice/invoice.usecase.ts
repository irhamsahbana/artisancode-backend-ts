import { CheckStatusRes, IPaymentGateway } from '@/contracts/integration'
import { IInvoiceRepo, IInvoiceUsecase } from '@/contracts/invoice.contract'
import {
  ActiveInvoiceStatuses,
  Invoice,
  InvoiceStatus,
} from '@/entities/invoice.entity'
import { withSpan } from '@/telemetry'

import { createInvoice } from './invoice.usecase/create'
import { findActiveInvoiceByEnrollment } from './invoice.usecase/find-active-by-enrollment'
import { findInvoiceById } from './invoice.usecase/find-by-id'
import { findInvoiceList } from './invoice.usecase/find-list'
import { updateInvoiceStatus } from './invoice.usecase/update-status'

export interface InvoiceUsecaseDeps {
  repo: IInvoiceRepo
  paymentGateway: IPaymentGateway
  generatePaymentLink: (id: string, companyId: string) => Promise<Invoice>
  resolveDokuStatus: (payload: CheckStatusRes) => Promise<InvoiceStatus | null>
}

async function generatePaymentLink(
  deps: InvoiceUsecaseDeps,
  id: string,
  companyId: string,
): Promise<Invoice> {
  const invoice = await deps.repo.findById(id, companyId)
  if (!invoice) throw new Error('Invoice not found')

  if (invoice.status === 'paid') {
    throw new Error('Invoice is already paid')
  }

  if (invoice.payment_url) {
    let statusPayload: CheckStatusRes
    try {
      statusPayload = await deps.paymentGateway.checkStatus(invoice.invoice_number)
    } catch {
      throw new Error('DOKU status check failed')
    }
    const resolvedStatus = await deps.resolveDokuStatus(statusPayload)

    if (!resolvedStatus) {
      throw new Error('DOKU status is not recognized')
    }

    if (resolvedStatus === 'paid') {
      return deps.repo.update({
        id,
        company_id: companyId,
        status: 'paid',
        paid_at: new Date(),
      })
    }

    if (resolvedStatus === 'pending') {
      if (!ActiveInvoiceStatuses.includes(invoice.status as InvoiceStatus)) {
        return deps.repo.update({
          id,
          company_id: companyId,
          status: 'pending',
        })
      }
      return invoice
    }

    if (resolvedStatus === 'cancelled') {
      return deps.repo.update({
        id,
        company_id: companyId,
        status: 'cancelled',
      })
    }

    await deps.repo.update({
      id,
      company_id: companyId,
      status: resolvedStatus,
    })
  }

  const paymentLink = await deps.paymentGateway.generatePaymentLink({
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

  return deps.repo.update({
    id,
    company_id: companyId,
    status: 'pending',
    doku_invoice_id: paymentLink.invoice_id,
    doku_request_id: paymentLink.request_id,
    payment_url: paymentLink.payment_url,
  })
}

async function resolveDokuStatus(payload: CheckStatusRes): Promise<InvoiceStatus | null> {
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
}

export function createInvoiceUsecase(
  repo: IInvoiceRepo,
  paymentGateway: IPaymentGateway,
): IInvoiceUsecase {
  const deps: InvoiceUsecaseDeps = {
    repo,
    paymentGateway,
    generatePaymentLink: (id, companyId) => generatePaymentLink(deps, id, companyId),
    resolveDokuStatus,
  }

  return {
    create: (data) =>
      withSpan('InvoiceUsecase.create', () => createInvoice(deps, data)),
    findById: (id, companyId) => findInvoiceById(deps, id, companyId),
    findList: (req) => findInvoiceList(deps, req),
    updateStatus: (id, companyId, status) =>
      withSpan('InvoiceUsecase.updateStatus', () =>
        updateInvoiceStatus(deps, id, companyId, status)),
    generatePaymentLink: (id, companyId) =>
      withSpan('InvoiceUsecase.generatePaymentLink', () =>
        generatePaymentLink(deps, id, companyId)),
    findActiveByEnrollment: (enrollmentId, companyId) =>
      findActiveInvoiceByEnrollment(deps, enrollmentId, companyId),
  }
}

export default createInvoiceUsecase
