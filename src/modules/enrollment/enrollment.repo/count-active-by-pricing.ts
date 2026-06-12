import { eq, and, isNull, sql } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { enrollments } from '@/db/schema'

export async function countActiveEnrollmentsByPricing(
  pricingId: string,
  companyId: string,
): Promise<number> {
  const exec = getExecutor()
  const [result] = await exec
    .select({ count: sql<number>`count(*)::int` })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.productPricingId, pricingId),
        eq(enrollments.companyId, companyId),
        eq(enrollments.status, 'active'),
        isNull(enrollments.deletedAt),
      ),
    )
  return result.count
}
