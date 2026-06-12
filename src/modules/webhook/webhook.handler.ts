import { and, eq, gte, lte, isNull } from 'drizzle-orm'
import { Context } from 'hono'

import { db } from '../../common/db'
import { responseSuccess } from '../../common/rest_response'
import { AppEnv } from '../../common/types'
import { generateInvoiceNumber } from '../../common/utils/invoice.util'
import { selectValidPrice } from '../../common/utils/select_valid_price'
import logger from '../../config/logger'
import {
  enrollments,
  invoices,
  payments,
  productPrices as productPricesTable,
  students,
} from '../../db/schema'
import { createPaymentGateway } from '../../integrations'

const paymentGateway = createPaymentGateway()

type InvoiceWithEnrollment = typeof invoices.$inferSelect & {
  enrollment: typeof enrollments.$inferSelect | null
}

export class WebhookHandler {
  doku = async (c: Context<AppEnv>) => {
    try {
      const rawBody = c.get('rawBody')
      const headers = Object.fromEntries(c.req.raw.headers.entries())
      const targetPath = c.req.url

      if (!paymentGateway.verifyNotificationSignature(headers, rawBody ?? '', targetPath ?? '')) {
        logger.warn('Invalid DOKU Signature', { headers, body: c.req.json() })
        return c.json({ message: 'Invalid Signature' }, 401)
      }

      const body = await c.req.json()
      const service = body?.service || {}
      const acquirer = body?.acquirer || {}
      const channel = body?.channel || {}
      const order = body?.order || {}
      const transaction = body?.transaction || {}
      const virtualAccountInfo = body?.virtual_account_info
      const virtualAccountPayment = body?.virtual_account_payment
      const creditCardPayment =
        body?.credit_card_payment || body?.card_payment || body?.credit_card_info
      const qrisInfo = body?.qris || body?.qris_info || body?.qris_payment

      const readablePayload = {
        service_id: service?.id,
        acquirer_id: acquirer?.id,
        channel_id: channel?.id,
        transaction_status: transaction?.status,
        transaction_date: transaction?.date,
        transaction_request_id: transaction?.original_request_id,
        invoice_number: order?.invoice_number,
        amount: order?.amount,
        virtual_account_number: virtualAccountInfo?.virtual_account_number,
        virtual_account_identifier:
          virtualAccountPayment?.identifier || virtualAccountPayment?.identifer,
        qris_info: qrisInfo,
        credit_card_payment: creditCardPayment,
      }

      logger.info('DOKU Webhook received', { headers, readable_payload: readablePayload })

      const invoiceNumber = order?.invoice_number

      if (!invoiceNumber || typeof invoiceNumber !== 'string') {
        logger.warn('Webhook received without invoice number', body)
        return c.json({ message: 'Invalid payload' }, 400)
      }

      const statusValue = String(transaction?.status || '')
      const normalizedStatus = statusValue.toUpperCase()
      const transactionRequestId =
        typeof transaction?.original_request_id === 'string'
          ? transaction.original_request_id
          : null

      const invoice = await this.getInvoiceByNumber(invoiceNumber)
      if (!invoice) {
        logger.error(`Invoice not found for webhook: ${invoiceNumber}`)
        return c.json({ message: 'Invoice not found' }, 404)
      }

      const handled = await this.handleDokuStatus({
        normalizedStatus,
        invoiceNumber,
        invoice,
        transactionRequestId,
        c,
      })
      if (handled) return handled

      await this.updateTransactionRequestId(invoice, transactionRequestId)
      return c.json(responseSuccess({ message: 'Webhook processed' }))
    } catch (error) {
      logger.error('Webhook Error:', error)
      throw error
    }
  }

  private async getInvoiceByNumber(invoiceNumber: string): Promise<InvoiceWithEnrollment | null> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.invoiceNumber, invoiceNumber))
      .limit(1)

    if (!invoice) return null

    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.id, invoice.enrollmentId))
      .limit(1)

    return { ...invoice, enrollment: enrollment ?? null }
  }

  private async handleDokuStatus({
    normalizedStatus,
    invoiceNumber,
    invoice,
    transactionRequestId,
    c,
  }: {
    normalizedStatus: string
    invoiceNumber: string
    invoice: InvoiceWithEnrollment
    transactionRequestId: string | null
    c: Context<AppEnv>
  }) {
    if (normalizedStatus === 'SUCCESS') {
      return this.handleSuccess({
        invoiceNumber,
        invoice,
        transactionRequestId,
        c,
      })
    }

    if (normalizedStatus === 'EXPIRED') {
      return this.handleExpired({
        invoiceNumber,
        invoice,
        transactionRequestId,
        c,
      })
    }

    return null
  }

  private async handleSuccess({
    invoiceNumber,
    invoice,
    transactionRequestId,
    c,
  }: {
    invoiceNumber: string
    invoice: InvoiceWithEnrollment
    transactionRequestId: string | null
    c: Context<AppEnv>
  }) {
    logger.info(`Processing successful payment for ${invoiceNumber}`)

    if (invoice.status === 'paid') {
      logger.info(`Invoice ${invoiceNumber} already paid. Ignoring.`)
      return c.json(responseSuccess({ message: 'Already paid' }))
    }

    const paidAt = new Date()

    // Transaction: create payment + update invoice status
    await db.transaction(async (tx) => {
      await tx.insert(payments).values({
        companyId: invoice.companyId,
        branchId: invoice.branchId,
        invoiceId: invoice.id,
        amount: invoice.amount,
        method: 'DOKU',
        paymentDate: paidAt,
      })

      await tx
        .update(invoices)
        .set({
          status: 'paid',
          paidAt: paidAt,
          dokuRequestId: transactionRequestId || undefined,
        })
        .where(eq(invoices.id, invoice.id))
    })

    const enrollment = invoice.enrollment
    const currentBillingDate = enrollment?.nextBillingDate

    if (enrollment && currentBillingDate && enrollment.billingCycle) {
      await this.updateEnrollmentBilling(enrollment, currentBillingDate)
    }

    logger.info(`Payment processed successfully for ${invoiceNumber}`)
    return c.json(responseSuccess({ message: 'Webhook processed' }))
  }

  private async handleExpired({
    invoiceNumber,
    invoice,
    transactionRequestId,
    c,
  }: {
    invoiceNumber: string
    invoice: InvoiceWithEnrollment
    transactionRequestId: string | null
    c: Context<AppEnv>
  }) {
    logger.info(`Processing expired payment for ${invoiceNumber}`)

    if (invoice.status === 'paid') {
      logger.info(`Invoice ${invoiceNumber} already paid. Ignoring.`)
      return c.json(responseSuccess({ message: 'Already paid' }))
    }

    if (invoice.status !== 'expired') {
      await db
        .update(invoices)
        .set({
          status: 'expired',
          dokuRequestId: transactionRequestId || undefined,
        })
        .where(eq(invoices.id, invoice.id))
    } else if (transactionRequestId) {
      await db
        .update(invoices)
        .set({ dokuRequestId: transactionRequestId })
        .where(eq(invoices.id, invoice.id))
    }

    logger.info(`Expired status recorded for ${invoiceNumber}`)
    return c.json(responseSuccess({ message: 'Webhook processed' }))
  }

  private async updateTransactionRequestId(
    invoice: InvoiceWithEnrollment,
    transactionRequestId: string | null,
  ) {
    if (!transactionRequestId || invoice.dokuRequestId === transactionRequestId) return
    await db
      .update(invoices)
      .set({ dokuRequestId: transactionRequestId })
      .where(eq(invoices.id, invoice.id))
  }

  private async updateEnrollmentBilling(
    enrollment: NonNullable<InvoiceWithEnrollment['enrollment']>,
    currentBillingDate: Date,
  ) {
    const nextDate = new Date(currentBillingDate)

    switch (enrollment.billingCycle) {
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1)
        break
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3)
        break
      case 'annually':
        nextDate.setFullYear(nextDate.getFullYear() + 1)
        break
      case 'one_time':
        break
    }

    await db
      .update(enrollments)
      .set({ nextBillingDate: nextDate })
      .where(eq(enrollments.id, enrollment.id))

    logger.info(`Updated enrollment ${enrollment.id} next billing date to ${nextDate}`)

    if (enrollment.billingCycle === 'one_time') return

    const todayPlusBuffer = new Date()
    todayPlusBuffer.setDate(todayPlusBuffer.getDate() + 7)

    if (nextDate <= todayPlusBuffer) {
      await this.handleCatchUpInvoice(enrollment, nextDate)
    }
  }

  private async handleCatchUpInvoice(
    enrollment: NonNullable<InvoiceWithEnrollment['enrollment']>,
    nextDate: Date,
  ) {
    // Fetch enrollment details with student and pricing
    const [enrollmentDetails] = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.id, enrollment.id),
          eq(enrollments.status, 'active'),
          isNull(enrollments.deletedAt),
        ),
      )
      .limit(1)

    if (!enrollmentDetails) {
      logger.warn(`Enrollment ${enrollment.id} not found for catch-up`)
      return
    }

    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, enrollmentDetails.studentId))
      .limit(1)

    if (!student) {
      logger.warn(`Student not found for enrollment ${enrollment.id}`)
      return
    }

    // Fetch prices for the pricing
    const prices = await db
      .select({
        id: productPricesTable.id,
        productPricingId: productPricesTable.productPricingId,
        price: productPricesTable.price,
        currency: productPricesTable.currency,
        startedAt: productPricesTable.startedAt,
        endedAt: productPricesTable.endedAt,
        createdAt: productPricesTable.createdAt,
      })
      .from(productPricesTable)
      .where(eq(productPricesTable.productPricingId, enrollmentDetails.productPricingId))

    const startOfDay = new Date(nextDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(nextDate)
    endOfDay.setHours(23, 59, 59, 999)

    const [existingInvoice] = await db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.enrollmentId, enrollment.id),
          gte(invoices.dueDate, startOfDay),
          lte(invoices.dueDate, endOfDay),
          isNull(invoices.deletedAt),
        ),
      )
      .limit(1)

    if (existingInvoice) {
      logger.info(`Catch-up skipped for enrollment ${enrollment.id}, invoice already exists`)
      return
    }

    const currency = enrollmentDetails.currency
    const priceCandidates = prices.filter((price) => price.currency === currency)
    const selectedPrice = selectValidPrice(priceCandidates, nextDate)

    if (!selectedPrice) {
      logger.warn(`No valid price found for catch-up enrollment ${enrollment.id}`)
      return
    }

    const amount = Number(selectedPrice.price)
    const invoiceNumber = generateInvoiceNumber()

    const [createdInvoice] = await db
      .insert(invoices)
      .values({
        companyId: enrollmentDetails.companyId,
        branchId: enrollmentDetails.branchId,
        enrollmentId: enrollmentDetails.id,
        invoiceNumber,
        amount: String(amount),
        dueDate: nextDate,
        issuedDate: new Date(),
        invoiceDate: new Date(),
        status: 'pending',
        currency: selectedPrice.currency,
      })
      .returning()

    const paymentLink = await paymentGateway.generatePaymentLink({
      invoice_number: invoiceNumber,
      amount,
      customer_email: student.email,
      customer_name: `${student.firstName} ${student.lastName}`,
    })

    await db
      .update(invoices)
      .set({
        dokuInvoiceId: paymentLink.invoice_id,
        paymentUrl: paymentLink.payment_url,
      })
      .where(eq(invoices.id, createdInvoice.id))

    logger.info(`Catch-up invoice generated for enrollment ${enrollment.id} due ${nextDate}`)
  }
}
