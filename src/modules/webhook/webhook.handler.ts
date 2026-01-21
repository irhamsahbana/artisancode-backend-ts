import { NextFunction, Request, Response } from 'express'

import { prisma } from '../../common/prisma'
import { responseSuccess } from '../../common/rest_response'
import logger from '../../config/logger'

export class WebhookHandler {
  doku = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: Verify Signature using Doku Library or manual HMAC
      // const signature = req.headers['client-id'] ...

      const { order, transaction } = req.body

      if (!order || !order.invoice_number) {
        logger.warn('Webhook received without invoice number', req.body)
        return res.status(400).json({ message: 'Invalid payload' })
      }

      if (transaction && transaction.status === 'SUCCESS') {
        const invoiceNumber = order.invoice_number
        logger.info(`Processing successful payment for ${invoiceNumber}`)

        const invoice = await prisma.invoice.findFirst({
          where: { invoiceNumber },
          include: { enrollment: true },
        })

        if (!invoice) {
          logger.error(`Invoice not found for webhook: ${invoiceNumber}`)
          return res.status(404).json({ message: 'Invoice not found' })
        }

        if (invoice.status === 'paid') {
          logger.info(`Invoice ${invoiceNumber} already paid. Ignoring.`)
          return res.json(responseSuccess({ message: 'Already paid' }))
        }

        // Create Payment Record
        await prisma.payment.create({
          data: {
            companyId: invoice.companyId,
            branchId: invoice.branchId,
            invoiceId: invoice.id,
            amount: invoice.amount,
            method: 'DOKU',
            paymentDate: new Date(),
          },
        })

        // Update Invoice
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            status: 'paid',
            paidAt: new Date(),
          },
        })

        // Update Enrollment Next Billing Date
        const enrollment = invoice.enrollment
        if (enrollment && enrollment.nextBillingDate && enrollment.billingCycle) {
          const nextDate = new Date(enrollment.nextBillingDate)

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
              // No update needed
              break
          }

          await prisma.enrollment.update({
            where: { id: enrollment.id },
            data: {
              nextBillingDate: nextDate,
            },
          })

          logger.info(`Updated enrollment ${enrollment.id} next billing date to ${nextDate}`)
        }

        logger.info(`Payment processed successfully for ${invoiceNumber}`)
      }

      return res.json(responseSuccess({ message: 'Webhook processed' }))
    } catch (error) {
      logger.error('Webhook Error:', error)
      next(error)
    }
  }
}
