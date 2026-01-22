import cron from 'node-cron'

import { prisma } from '../common/prisma'
import { generateInvoiceNumber } from '../common/utils/invoice.util'
import { selectValidPrice } from '../common/utils/select_valid_price'
import logger from '../config/logger'
import { DokuProvider } from '../providers/doku'

const dokuProvider = new DokuProvider()

export const startInvoiceGeneratorJob = () => {
  // Run daily at 01:00 AM
  cron.schedule('0 1 * * *', async () => {
    logger.info('Starting Invoice Generator Job...')

    try {
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

      // Reset time to start of day for comparison if needed,
      // or use range. For simplicity, let's find enrollments where nextBillingDate is exactly 7 days away (ignoring time)
      const startOfDay = new Date(sevenDaysFromNow.setHours(0, 0, 0, 0))
      const endOfDay = new Date(sevenDaysFromNow.setHours(23, 59, 59, 999))

      const enrollments = await prisma.enrollment.findMany({
        where: {
          status: 'active',
          nextBillingDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          deletedAt: null,
        },
        include: {
          student: true,
          productPricing: {
            include: {
              prices: true,
            },
          },
        },
      })

      logger.info(`Found ${enrollments.length} enrollments due for invoicing.`)

      for (const enrollment of enrollments) {
        try {
          if (!enrollment.nextBillingDate) {
            logger.warn(`Enrollment ${enrollment.id} has no nextBillingDate, skipping.`)
            continue
          }

          const billingDate = new Date(enrollment.nextBillingDate)
          const selectedPrice = selectValidPrice(enrollment.productPricing.prices, billingDate)

          if (!selectedPrice) {
            logger.warn(`No valid price found for enrollment ${enrollment.id}`)
            continue
          }

          const amount = selectedPrice.price.toNumber()
          const invoiceNumber = generateInvoiceNumber()

          // Create Invoice
          const invoice = await prisma.invoice.create({
            data: {
              companyId: enrollment.companyId,
              branchId: enrollment.branchId,
              enrollmentId: enrollment.id,
              invoiceNumber,
              amount,
              dueDate: enrollment.nextBillingDate, // Due on the billing date
              issuedDate: new Date(),
              invoiceDate: new Date(),
              status: 'pending',
              currency: selectedPrice.currency,
            },
          })

          // Generate DOKU Link
          const paymentLink = await dokuProvider.generatePaymentLink({
            invoice_number: invoiceNumber,
            amount,
            customer_email: enrollment.student.email,
            customer_name: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
          })

          // Update Invoice
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
              dokuInvoiceId: paymentLink.invoice_id,
              paymentUrl: paymentLink.payment_url,
            },
          })

          // Send Email (Mock)
          logger.info(
            `Invoice generated and sent to ${enrollment.student.email} for amount ${amount}`,
          )
        } catch (err) {
          logger.error(`Failed to process enrollment ${enrollment.id}:`, err)
        }
      }
    } catch (error) {
      logger.error('Error in Invoice Generator Job:', error)
    }
  })
}
