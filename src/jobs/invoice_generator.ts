import { and, eq, gte, isNull, lte } from 'drizzle-orm'
import cron from 'node-cron'

import { db } from '@/common/db'
import { generateInvoiceNumber } from '@/common/utils/invoice.util'
import { selectValidPrice } from '@/common/utils/select_valid_price'
import logger from '@/config/logger'
import { enrollments, invoices, productPrices, productPricings, students } from '@/db/schema'
import { createEmailService, createPaymentGateway } from '@/integrations'

const paymentGateway = createPaymentGateway()
const emailService = createEmailService()

export const startInvoiceGeneratorJob = () => {
  // Run daily at 01:00 AM
  cron.schedule('0 1 * * *', async () => {
    logger.info('Starting Invoice Generator Job...')

    try {
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

      const startOfDay = new Date(sevenDaysFromNow.setHours(0, 0, 0, 0))
      const endOfDay = new Date(sevenDaysFromNow.setHours(23, 59, 59, 999))

      // Find enrollments due for invoicing with related data
      const enrollmentRows = await db
        .select({
          id: enrollments.id,
          companyId: enrollments.companyId,
          branchId: enrollments.branchId,
          currency: enrollments.currency,
          nextBillingDate: enrollments.nextBillingDate,
          productPricingId: enrollments.productPricingId,
          studentId: enrollments.studentId,
          // Student fields
          studentFirstName: students.firstName,
          studentLastName: students.lastName,
          studentEmail: students.email,
          studentParentPhone: students.parentPhone,
          studentAddress: students.address,
          // Product pricing fields
          pricingName: productPricings.name,
        })
        .from(enrollments)
        .innerJoin(students, eq(enrollments.studentId, students.id))
        .innerJoin(productPricings, eq(enrollments.productPricingId, productPricings.id))
        .where(
          and(
            eq(enrollments.status, 'active'),
            gte(enrollments.nextBillingDate, startOfDay),
            lte(enrollments.nextBillingDate, endOfDay),
            isNull(enrollments.deletedAt),
          ),
        )

      logger.info(`Found ${enrollmentRows.length} enrollments due for invoicing.`)

      for (const enrollment of enrollmentRows) {
        try {
          if (!enrollment.nextBillingDate) {
            logger.warn(`Enrollment ${enrollment.id} has no nextBillingDate, skipping.`)
            continue
          }

          const billingDate = new Date(enrollment.nextBillingDate)

          // Fetch prices for this product pricing
          const priceRows = await db
            .select()
            .from(productPrices)
            .where(eq(productPrices.productPricingId, enrollment.productPricingId))

          const currency = enrollment.currency
          const priceCandidates = priceRows.filter((price) => price.currency === currency)
          const selectedPrice = selectValidPrice(priceCandidates, billingDate)

          if (!selectedPrice) {
            logger.warn(`No valid price found for enrollment ${enrollment.id}`)
            continue
          }

          const amount = Number(selectedPrice.price)
          const invoiceNumber = generateInvoiceNumber()

          // Create Invoice
          const [invoice] = await db
            .insert(invoices)
            .values({
              companyId: enrollment.companyId,
              branchId: enrollment.branchId,
              enrollmentId: enrollment.id,
              invoiceNumber,
              amount: String(amount),
              dueDate: enrollment.nextBillingDate,
              issuedDate: new Date(),
              invoiceDate: new Date(),
              status: 'pending',
              currency: selectedPrice.currency,
            })
            .returning()

          // Generate DOKU Link
          const paymentLink = await paymentGateway.generatePaymentLink({
            invoice_number: invoiceNumber,
            amount,
            customer_email: enrollment.studentEmail,
            customer_name: `${enrollment.studentFirstName} ${enrollment.studentLastName}`,
            customer_phone: enrollment.studentParentPhone,
            customer_address: enrollment.studentAddress,
            line_items: [
              {
                name: enrollment.pricingName,
                price: amount,
                quantity: 1,
              },
            ],
          })

          // Update Invoice
          await db
            .update(invoices)
            .set({
              dokuInvoiceId: paymentLink.invoice_id,
              dokuRequestId: paymentLink.request_id,
              paymentUrl: paymentLink.payment_url,
            })
            .where(eq(invoices.id, invoice.id))

          // Send invoice email
          await emailService.send({
            to: enrollment.studentEmail,
            subject: `New Invoice: ${invoiceNumber}`,
            html: `<p>A new invoice <strong>${invoiceNumber}</strong> has been generated for amount IDR ${amount.toLocaleString('id-ID')}.</p>`,
          })
        } catch (err) {
          logger.error(`Failed to process enrollment ${enrollment.id}:`, err)
        }
      }
    } catch (error) {
      logger.error('Error in Invoice Generator Job:', error)
    }
  })
}
