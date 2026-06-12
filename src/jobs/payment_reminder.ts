import { and, eq, gte, isNull, lte } from 'drizzle-orm'
import cron from 'node-cron'

import { db } from '@/common/db'
import logger from '@/config/logger'
import { enrollments, invoices, students } from '@/db/schema'
import { createEmailService } from '@/integrations'

const emailService = createEmailService()

export const startPaymentReminderJob = () => {
  // Run daily at 08:00 AM
  cron.schedule('0 8 * * *', async () => {
    logger.info('Starting Payment Reminder Job...')

    try {
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

      const startOfDay = new Date(threeDaysAgo.setHours(0, 0, 0, 0))
      const endOfDay = new Date(threeDaysAgo.setHours(23, 59, 59, 999))

      // Find pending invoices with enrollment and student data
      const invoiceRows = await db
        .select({
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          studentEmail: students.email,
        })
        .from(invoices)
        .innerJoin(enrollments, eq(invoices.enrollmentId, enrollments.id))
        .innerJoin(students, eq(enrollments.studentId, students.id))
        .where(
          and(
            eq(invoices.status, 'pending'),
            gte(invoices.issuedDate, startOfDay),
            lte(invoices.issuedDate, endOfDay),
            isNull(invoices.deletedAt),
          ),
        )

      logger.info(`Found ${invoiceRows.length} pending invoices for reminder.`)

      for (const invoice of invoiceRows) {
        await emailService.send({
          to: invoice.studentEmail,
          subject: `Payment Reminder: Invoice ${invoice.invoiceNumber}`,
          html: `<p>This is a reminder that your invoice <strong>${invoice.invoiceNumber}</strong> is pending payment.</p>`,
        })
      }
    } catch (error) {
      logger.error('Error in Payment Reminder Job:', error)
    }
  })
}
