import { IInvoiceRepo } from '@/contracts/invoice.contract'
import { Invoice } from '@/entities/invoice.entity'

import { createInvoice } from './invoice.repo/create'
import { findActiveInvoiceByEnrollment } from './invoice.repo/find-active-by-enrollment'
import { findInvoiceById } from './invoice.repo/find-by-id'
import { findInvoiceByInvoiceNumber } from './invoice.repo/find-by-invoice-number'
import { findInvoiceList } from './invoice.repo/find-list'
import { updateInvoice } from './invoice.repo/update'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToEntity(data: any): Invoice {
  let enrollment = undefined
  if (data.enrollment) {
    enrollment = {
      ...data.enrollment,
      student: data.enrollment.student
        ? {
            ...data.enrollment.student,
            first_name: data.enrollment.student.firstName,
            last_name: data.enrollment.student.lastName,
            email: data.enrollment.student.email,
            address: data.enrollment.student.address,
            parent_phone: data.enrollment.student.parentPhone,
            parent_email: data.enrollment.student.parentEmail,
          }
        : undefined,
      pricing: data.enrollment.productPricing
        ? {
            ...data.enrollment.productPricing,
            program_id: data.enrollment.productPricing.productId,
            is_active: data.enrollment.productPricing.isActive,
            created_at: data.enrollment.productPricing.createdAt,
            updated_at: data.enrollment.productPricing.updatedAt,
          }
        : undefined,
      program: data.enrollment.product
        ? {
            ...data.enrollment.product,
            company_id: data.enrollment.product.companyId,
            branch_id: data.enrollment.product.branchId,
            created_at: data.enrollment.product.createdAt,
            updated_at: data.enrollment.product.updatedAt,
            deleted_at: data.enrollment.product.deletedAt,
          }
        : undefined,
    }
  }

  return {
    id: data.id,
    company_id: data.companyId,
    branch_id: data.branchId,
    enrollment_id: data.enrollmentId,
    invoice_number: data.invoiceNumber,
    issued_date: data.issuedDate,
    due_date: data.dueDate,
    amount: Number(data.amount),
    currency: data.currency,
    status: data.status,
    doku_invoice_id: data.dokuInvoiceId,
    doku_request_id: data.dokuRequestId,
    payment_url: data.paymentUrl,
    paid_at: data.paidAt,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
    deleted_at: data.deletedAt,
    enrollment: enrollment,
  }
}

export interface InvoiceRepoDeps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapToEntity: (data: any) => Invoice
}

export function createInvoiceRepo(): IInvoiceRepo {
  const deps: InvoiceRepoDeps = { mapToEntity }

  return {
    create: (data) => createInvoice(deps, data),
    findById: (id, companyId) => findInvoiceById(deps, id, companyId),
    findList: (req) => findInvoiceList(deps, req),
    update: (data) => updateInvoice(deps, data),
    findByInvoiceNumber: (invoiceNumber, companyId) =>
      findInvoiceByInvoiceNumber(deps, invoiceNumber, companyId),
    findActiveByEnrollment: (enrollmentId, companyId) =>
      findActiveInvoiceByEnrollment(deps, enrollmentId, companyId),
  }
}

export default createInvoiceRepo
