import { getExecutor } from '@/common/executor'
import { AppError } from '@/common/packages/types'
import { enrollments } from '@/db/schema'
import * as Entity from '@/entities/enrollment.entity'

import { EnrollmentErrorCode } from '../enrollment.errors'
import { EnrollmentRepoDeps } from '../enrollment.repo'

export async function createEnrollment(
  deps: EnrollmentRepoDeps,
  req: Entity.CreateEnrollmentReq,
): Promise<Entity.Enrollment> {
  const exec = getExecutor()
  const [row] = await exec
    .insert(enrollments)
    .values({
      companyId: req.company_id,
      branchId: req.branch_id,
      studentId: req.student_id,
      productId: req.program_id,
      productPricingId: req.pricing_id,
      currency: req.currency ?? 'IDR',
      status: (req.status as 'active' | 'inactive') || 'active',
      billingCycle:
        (req.billing_cycle as 'monthly' | 'quarterly' | 'annually' | 'one_time') || 'monthly',
      nextBillingDate: req.next_billing_date,
      autoRenew: req.auto_renew ?? true,
      createdAt: req.enrollment_date,
    })
    .returning()

  const data = await deps.findEnrollmentWithRelations(row.id)
  if (!data) {
    throw new AppError(EnrollmentErrorCode.NOT_FOUND, 'Enrollment not found', { httpCode: 404 })
  }
  return deps.toEnrollmentEntity(data)
}
