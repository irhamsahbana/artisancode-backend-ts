import { InvoiceStatus, Prisma } from '@prisma/client'

import { IInvoiceRepo } from './invoice.contract'
import { prisma } from '../../common/prisma'
import {
  CreateInvoiceReq,
  GetInvoiceReq,
  Invoice,
  InvoiceList,
  UpdateInvoiceReq,
} from '../../entities/invoice.entity'

export class InvoiceRepo implements IInvoiceRepo {
  async create(data: CreateInvoiceReq): Promise<Invoice> {
    const invoice = await prisma.invoice.create({
      data: {
        companyId: data.company_id,
        branchId: data.branch_id,
        enrollmentId: data.enrollment_id,
        amount: data.amount,
        dueDate: data.due_date,
        issuedDate: data.issued_date || new Date(),
        invoiceDate: data.issued_date || new Date(),
        status: (data.status as InvoiceStatus) || InvoiceStatus.pending,
        invoiceNumber: this.generateInvoiceNumber(),
      },
    })
    return this.mapToEntity(invoice)
  }

  async findById(id: string, company_id: string): Promise<Invoice | null> {
    const invoice = await prisma.invoice.findFirst({
      where: { id, companyId: company_id, deletedAt: null },
      include: {
        enrollment: {
          include: {
            student: true,
            product: true,
          },
        },
      },
    })
    return invoice ? this.mapToEntity(invoice) : null
  }

  async findByInvoiceNumber(invoiceNumber: string, company_id: string): Promise<Invoice | null> {
    const invoice = await prisma.invoice.findFirst({
      where: { invoiceNumber, companyId: company_id, deletedAt: null },
    })
    return invoice ? this.mapToEntity(invoice) : null
  }

  async findAll(req: GetInvoiceReq): Promise<InvoiceList> {
    const { page = 1, per_page = 10 } = req.pagination || {}
    const skip = (page - 1) * per_page

    const where: Prisma.InvoiceWhereInput = {
      companyId: req.company_id,
      deletedAt: null,
    }

    if (req.enrollment_id) where.enrollmentId = req.enrollment_id
    if (req.status) where.status = req.status as InvoiceStatus

    const [total, invoices] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        skip,
        take: per_page,
        orderBy: { createdAt: 'desc' },
        include: {
          enrollment: {
            include: {
              student: true,
            },
          },
        },
      }),
    ])

    return {
      items: invoices.map(this.mapToEntity),
      pagination: {
        total,
        last_page: Math.ceil(total / per_page),
        page,
        per_page,
      },
    }
  }

  async update(data: UpdateInvoiceReq): Promise<Invoice> {
    const updateData: Prisma.InvoiceUpdateInput = {}
    if (data.status) updateData.status = data.status as InvoiceStatus
    if (data.paid_at) updateData.paidAt = data.paid_at
    if (data.doku_invoice_id) updateData.dokuInvoiceId = data.doku_invoice_id
    if (data.payment_url) updateData.paymentUrl = data.payment_url

    const invoice = await prisma.invoice.update({
      where: { id: data.id },
      data: updateData,
    })
    return this.mapToEntity(invoice)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapToEntity(data: any): Invoice {
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
      payment_url: data.paymentUrl,
      paid_at: data.paidAt,
      created_at: data.createdAt,
      updated_at: data.updatedAt,
      deleted_at: data.deletedAt,
      enrollment: enrollment,
    }
  }

  private generateInvoiceNumber(): string {
    // Simple generation for now, can be improved to be sequential per company
    return `INV/${new Date().getFullYear()}/${Date.now().toString().slice(-6)}`
  }
}
