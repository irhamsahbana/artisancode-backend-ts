import { eq, and, inArray, isNull, sql } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { generateInvoiceNumber } from '@/common/utils/invoice.util'
import { enrollments, invoices, productPricings, products, students } from '@/db/schema'
import {
  ActiveInvoiceStatuses,
  CreateInvoiceReq,
  GetInvoiceReq,
  Invoice,
  InvoiceList,
  UpdateInvoiceReq,
} from '@/entities/invoice.entity'

import { IInvoiceRepo } from './invoice.contract'

export default class InvoiceRepo implements IInvoiceRepo {
  async create(data: CreateInvoiceReq): Promise<Invoice> {
    const exec = getExecutor()
    const [row] = await exec
      .insert(invoices)
      .values({
        companyId: data.company_id,
        branchId: data.branch_id,
        enrollmentId: data.enrollment_id,
        amount: String(data.amount),
        currency: data.currency || 'IDR',
        dueDate: data.due_date,
        issuedDate: data.issued_date || new Date(),
        invoiceDate: data.issued_date || new Date(),
        status: (data.status as Invoice['status']) || 'pending',
        invoiceNumber: generateInvoiceNumber(),
      })
      .returning()
    return this.mapToEntity(row)
  }

  async findById(id: string, companyId: string): Promise<Invoice | null> {
    const exec = getExecutor()
    const [row] = await exec
      .select()
      .from(invoices)
      .where(
        and(eq(invoices.id, id), eq(invoices.companyId, companyId), isNull(invoices.deletedAt)),
      )
      .limit(1)
    if (!row) return null

    // Fetch enrollment with relations
    const [enrollment] = await exec
      .select()
      .from(enrollments)
      .where(eq(enrollments.id, row.enrollmentId))
      .limit(1)

    let student = null
    let product = null
    let pricing = null

    if (enrollment) {
      ;[student, product, pricing] = await Promise.all([
        enrollment.studentId
          ? exec
              .select()
              .from(students)
              .where(eq(students.id, enrollment.studentId))
              .then((r) => r[0] ?? null)
          : null,
        enrollment.productId
          ? exec
              .select()
              .from(products)
              .where(eq(products.id, enrollment.productId))
              .then((r) => r[0] ?? null)
          : null,
        enrollment.productPricingId
          ? exec
              .select()
              .from(productPricings)
              .where(eq(productPricings.id, enrollment.productPricingId))
              .then((r) => r[0] ?? null)
          : null,
      ])
    }

    return this.mapToEntity({
      ...row,
      enrollment: enrollment
        ? {
            ...enrollment,
            student,
            product,
            productPricing: pricing,
          }
        : null,
    })
  }

  async findByInvoiceNumber(invoiceNumber: string, companyId: string): Promise<Invoice | null> {
    const exec = getExecutor()
    const [row] = await exec
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.invoiceNumber, invoiceNumber),
          eq(invoices.companyId, companyId),
          isNull(invoices.deletedAt),
        ),
      )
      .limit(1)
    return row ? this.mapToEntity(row) : null
  }

  async findActiveByEnrollment(enrollmentId: string, companyId: string): Promise<Invoice | null> {
    const exec = getExecutor()
    const [row] = await exec
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.enrollmentId, enrollmentId),
          eq(invoices.companyId, companyId),
          isNull(invoices.deletedAt),
          inArray(invoices.status, ActiveInvoiceStatuses),
        ),
      )
      .orderBy(sql`${invoices.createdAt} desc`)
      .limit(1)
    return row ? this.mapToEntity(row) : null
  }

  async findList(req: GetInvoiceReq): Promise<InvoiceList> {
    const { page = 1, per_page = 10 } = req.pagination || {}
    const offset = (page - 1) * per_page

    const conditions = [eq(invoices.companyId, req.company_id), isNull(invoices.deletedAt)]

    if (req.enrollment_id) {
      conditions.push(eq(invoices.enrollmentId, req.enrollment_id))
    }
    if (req.status) {
      conditions.push(eq(invoices.status, req.status as Invoice['status']))
    }

    const where = and(...conditions)

    const exec = getExecutor()
    const [items, countResult] = await Promise.all([
      exec
        .select()
        .from(invoices)
        .where(where)
        .orderBy(sql`${invoices.createdAt} desc`)
        .limit(per_page)
        .offset(offset),
      exec
        .select({ count: sql<number>`count(*)::int` })
        .from(invoices)
        .where(where),
    ])

    const total = countResult[0]?.count ?? 0

    return {
      items: items.map((item) => this.mapToEntity(item)),
      pagination: {
        total,
        last_page: Math.ceil(total / per_page),
        page,
        per_page,
      },
    }
  }

  async update(data: UpdateInvoiceReq): Promise<Invoice> {
    const updateData: Record<string, unknown> = {}
    if (data.status) updateData.status = data.status
    if (data.paid_at) updateData.paidAt = data.paid_at
    if (data.doku_invoice_id) updateData.dokuInvoiceId = data.doku_invoice_id
    if (data.doku_request_id) updateData.dokuRequestId = data.doku_request_id
    if (data.payment_url) updateData.paymentUrl = data.payment_url

    const exec = getExecutor()
    const [row] = await exec
      .update(invoices)
      .set(updateData)
      .where(eq(invoices.id, data.id))
      .returning()
    return this.mapToEntity(row)
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
}
