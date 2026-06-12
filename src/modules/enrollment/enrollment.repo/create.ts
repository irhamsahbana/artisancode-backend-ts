import { getExecutor } from '@/common/executor'
import { enrollments } from '@/db/schema'
import * as Entity from '@/entities/enrollment.entity'

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
  if (!data) throw new Error('Enrollment not found')
  return deps.toEnrollmentEntity(data)
}
