import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { enrollments } from '@/db/schema'
import * as Entity from '@/entities/enrollment.entity'

import { EnrollmentRepoDeps } from '../enrollment.repo'

export async function updateEnrollment(
  deps: EnrollmentRepoDeps,
  req: Entity.UpdateEnrollmentReq,
): Promise<Entity.Enrollment> {
  const exec = getExecutor()
  const [row] = await exec
    .update(enrollments)
    .set({
      branchId: req.branch_id,
      studentId: req.student_id,
      productId: req.program_id,
      productPricingId: req.pricing_id,
      currency: req.currency,
      status: req.status as 'active' | 'inactive',
    })
    .where(
      and(
        eq(enrollments.id, req.id),
        eq(enrollments.companyId, req.company_id),
        isNull(enrollments.deletedAt),
      ),
    )
    .returning()

  const data = await deps.findEnrollmentWithRelations(row.id)
  if (!data) throw new Error('Enrollment not found')
  return deps.toEnrollmentEntity(data)
}
