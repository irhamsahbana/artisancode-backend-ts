import cron from 'node-cron'

import { prisma } from '../common/prisma'
import logger from '../config/logger'

export const startPaymentReminderJob = () => {
  // Run daily at 08:00 AM
  cron.schedule('0 8 * * *', async () => {
    logger.info('Starting Payment Reminder Job...')

    try {
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

      const startOfDay = new Date(threeDaysAgo.setHours(0, 0, 0, 0))
      const endOfDay = new Date(threeDaysAgo.setHours(23, 59, 59, 999))

      const invoices = await prisma.invoice.findMany({
        where: {
          status: 'pending',
          issuedDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          deletedAt: null,
        },
        include: {
          enrollment: {
            include: {
              student: true,
            },
          },
        },
      })

      logger.info(`Found ${invoices.length} pending invoices for reminder.`)

      for (const invoice of invoices) {
         // Send Email (Mock)
         logger.info(`Sending reminder to ${invoice.enrollment.student.email} for invoice ${invoice.invoiceNumber}`)
      }

    } catch (error) {
      logger.error('Error in Payment Reminder Job:', error)
    }
  })
}
