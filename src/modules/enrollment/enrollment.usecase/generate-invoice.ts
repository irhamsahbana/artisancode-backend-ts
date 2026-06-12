import { AppError } from '@/common/app_error'
import { selectValidPrice } from '@/common/utils/select_valid_price'
import * as Entity from '@/entities/enrollment.entity'
import { Invoice } from '@/entities/invoice.entity'

import { EnrollmentUsecaseDeps } from '../enrollment.usecase'

export async function generateEnrollmentInvoice(
  deps: EnrollmentUsecaseDeps,
  req: Entity.GenerateEnrollmentInvoiceReq,
): Promise<Invoice> {
  const enrollment = await deps.repo.findById(req.id, req.company_id)
  if (!enrollment) {
    throw new AppError(404, 'Enrollment not found')
  }

  if (enrollment.status !== 'active') {
    throw new AppError(400, 'Enrollment is not active')
  }

  const activeInvoice = await deps.invoiceUsecase.findActiveByEnrollment(
    enrollment.id,
    req.company_id,
  )
  if (activeInvoice) {
    return deps.invoiceUsecase.generatePaymentLink(activeInvoice.id, req.company_id)
  }

  const pricing = enrollment.pricing
  const prices = pricing?.prices || []
  if (!pricing || prices.length === 0) {
    throw new AppError(400, 'Pricing is not available for this enrollment')
  }

  const effectiveEnrollmentDate = enrollment.enrollment_date
    ? new Date(enrollment.enrollment_date)
    : new Date()

  let validPrice = undefined
  if (enrollment.currency) {
    const candidates = prices.filter((price) => price.currency === enrollment.currency)
    validPrice = selectValidPrice(candidates, effectiveEnrollmentDate)
    if (!validPrice) {
      throw new AppError(400, 'Pricing has no valid price for the enrollment currency')
    }
  } else {
    validPrice = selectValidPrice(prices, effectiveEnrollmentDate)
    if (!validPrice) {
      throw new AppError(400, 'Pricing has no valid price for the enrollment date')
    }
  }

  const dueDate = enrollment.next_billing_date || enrollment.enrollment_date || new Date()
  const invoiceData = await deps.invoiceUsecase.create({
    company_id: req.company_id,
    branch_id: enrollment.branch_id,
    enrollment_id: enrollment.id,
    amount: validPrice.price,
    currency: enrollment.currency || validPrice.currency,
    due_date: dueDate,
    issued_date: new Date(),
    status: 'pending',
    user: req.user,
  })

  return deps.invoiceUsecase.generatePaymentLink(invoiceData.id, req.company_id)
}
