import { NextFunction, Request, Response } from 'express'

import { prisma } from '../../common/prisma'
import { responseSuccess } from '../../common/rest_response'
import { generateInvoiceNumber } from '../../common/utils/invoice.util'
import { selectValidPrice } from '../../common/utils/select_valid_price'
import logger from '../../config/logger'
import { DokuProvider } from '../../providers/doku'

const dokuProvider = new DokuProvider()

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
              break
          }

          await prisma.enrollment.update({
            where: { id: enrollment.id },
            data: {
              nextBillingDate: nextDate,
            },
          })

          logger.info(`Updated enrollment ${enrollment.id} next billing date to ${nextDate}`)

          if (enrollment.billingCycle !== 'one_time') {
            const todayPlusBuffer = new Date()
            todayPlusBuffer.setDate(todayPlusBuffer.getDate() + 7)

            if (nextDate <= todayPlusBuffer) {
              const enrollmentDetails = await prisma.enrollment.findFirst({
                where: {
                  id: enrollment.id,
                  status: 'active',
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

              if (!enrollmentDetails) {
                logger.warn(`Enrollment ${enrollment.id} not found for catch-up`)
              } else {
                const startOfDay = new Date(nextDate)
                startOfDay.setHours(0, 0, 0, 0)
                const endOfDay = new Date(nextDate)
                endOfDay.setHours(23, 59, 59, 999)

                const existingInvoice = await prisma.invoice.findFirst({
                  where: {
                    enrollmentId: enrollment.id,
                    dueDate: {
                      gte: startOfDay,
                      lte: endOfDay,
                    },
                    deletedAt: null,
                  },
                })

                if (existingInvoice) {
                  logger.info(
                    `Catch-up skipped for enrollment ${enrollment.id}, invoice already exists`,
                  )
                } else {
                  const prices = enrollmentDetails.productPricing?.prices || []
                  const selectedPrice = selectValidPrice(prices, nextDate)

                  if (!selectedPrice) {
                    logger.warn(`No valid price found for catch-up enrollment ${enrollment.id}`)
                  } else {
                    const amount = selectedPrice.price.toNumber()
                    const invoiceNumber = generateInvoiceNumber()

                    const createdInvoice = await prisma.invoice.create({
                      data: {
                        companyId: enrollmentDetails.companyId,
                        branchId: enrollmentDetails.branchId,
                        enrollmentId: enrollmentDetails.id,
                        invoiceNumber,
                        amount,
                        dueDate: nextDate,
                        issuedDate: new Date(),
                        invoiceDate: new Date(),
                        status: 'pending',
                        currency: selectedPrice.currency,
                      },
                    })

                    const paymentLink = await dokuProvider.generatePaymentLink({
                      invoice_number: invoiceNumber,
                      amount,
                      customer_email: enrollmentDetails.student.email,
                      customer_name: `${enrollmentDetails.student.firstName} ${enrollmentDetails.student.lastName}`,
                    })

                    await prisma.invoice.update({
                      where: { id: createdInvoice.id },
                      data: {
                        dokuInvoiceId: paymentLink.invoice_id,
                        paymentUrl: paymentLink.payment_url,
                      },
                    })

                    logger.info(
                      `Catch-up invoice generated for enrollment ${enrollment.id} due ${nextDate}`,
                    )
                  }
                }
              }
            }
          }
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
