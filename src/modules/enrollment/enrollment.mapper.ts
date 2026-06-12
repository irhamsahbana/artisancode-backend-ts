import { and, eq, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { enrollments, productPricings, productPrices, products, students } from '@/db/schema'
import * as Entity from '@/entities/enrollment.entity'

type EnrollmentRow = typeof enrollments.$inferSelect

type EnrollmentWithRelations = EnrollmentRow & {
  student?: typeof students.$inferSelect | null
  product?: typeof products.$inferSelect | null
  productPricing?:
    | (typeof productPricings.$inferSelect & { prices?: (typeof productPrices.$inferSelect)[] })
    | null
}

export const toEnrollmentEntity = (data: EnrollmentWithRelations): Entity.Enrollment => ({
  id: data.id,
  company_id: data.companyId,
  branch_id: data.branchId,
  student_id: data.studentId,
  program_id: data.productId,
  pricing_id: data.productPricingId,
  currency: data.currency,
  status: data.status,
  billing_cycle: data.billingCycle,
  next_billing_date: data.nextBillingDate,
  auto_renew: data.autoRenew,
  created_at: data.createdAt,
  updated_at: data.updatedAt,
  deleted_at: data.deletedAt,
  student: data.student
    ? {
        id: data.student.id,
        company_id: data.student.companyId,
        branch_id: data.student.branchId,
        first_name: data.student.firstName,
        last_name: data.student.lastName,
        gender: data.student.gender,
        date_of_birth: data.student.dateOfBirth,
        birth_place: data.student.birthPlace,
        email: data.student.email,
        address: data.student.address,
        photo_url: data.student.photoUrl,
        parent_name: data.student.parentName,
        parent_phone: data.student.parentPhone,
        parent_email: data.student.parentEmail,
        emergency_contact_phone: data.student.emergencyContactPhone,
        blood_type: data.student.bloodType,
        medical_notes: data.student.medicalNotes,
        status: data.student.status,
        created_at: data.student.createdAt,
        updated_at: data.student.updatedAt,
        deleted_at: data.student.deletedAt,
      }
    : undefined,
  program: data.product
    ? {
        id: data.product.id,
        company_id: data.product.companyId,
        branch_id: data.product.branchId,
        name: data.product.name,
        description: data.product.description,
        capacity: data.product.capacity,
        status: data.product.status,
        created_at: data.product.createdAt,
        updated_at: data.product.updatedAt,
        deleted_at: data.product.deletedAt,
      }
    : undefined,
  pricing: data.productPricing
    ? {
        id: data.productPricing.id,
        program_id: data.productPricing.productId,
        name: data.productPricing.name,
        description: data.productPricing.description,
        is_active: data.productPricing.isActive,
        created_at: data.productPricing.createdAt,
        updated_at: data.productPricing.updatedAt,
        prices: (data.productPricing.prices || []).map((p) => ({
          id: p.id,
          pricing_id: p.productPricingId,
          currency: p.currency,
          price: Number(p.price),
          started_at: p.startedAt,
          ended_at: p.endedAt,
          created_at: p.createdAt,
        })),
      }
    : undefined,
})

/**
 * Fetch a single enrollment with all relations by ID
 */
export async function findEnrollmentWithRelations(
  enrollmentId: string,
  companyId?: string,
): Promise<EnrollmentWithRelations | null> {
  const conditions = [eq(enrollments.id, enrollmentId), isNull(enrollments.deletedAt)]
  if (companyId) {
    conditions.push(eq(enrollments.companyId, companyId))
  }

  const exec = getExecutor()
  const [enrollment] = await exec
    .select()
    .from(enrollments)
    .where(and(...conditions))
    .limit(1)
  if (!enrollment) return null

  const [student, product, pricing] = await Promise.all([
    enrollment.studentId
      ? exec
          .select()
          .from(students)
          .where(eq(students.id, enrollment.studentId))
          .then((r) => r[0] ?? null)
      : null,
    enrollment.productId
      ? exec
          .select()
          .from(products)
          .where(eq(products.id, enrollment.productId))
          .then((r) => r[0] ?? null)
      : null,
    enrollment.productPricingId
      ? exec
          .select()
          .from(productPricings)
          .where(eq(productPricings.id, enrollment.productPricingId))
          .then((r) => r[0] ?? null)
      : null,
  ])

  let prices: (typeof productPrices.$inferSelect)[] = []
  if (pricing) {
    prices = await exec
      .select()
      .from(productPrices)
      .where(eq(productPrices.productPricingId, pricing.id))
  }

  return {
    ...enrollment,
    student: student ?? undefined,
    product: product ?? undefined,
    productPricing: pricing ? { ...pricing, prices } : undefined,
  }
}

/**
 * Fetch multiple enrollments with relations by conditions
 */
export async function findEnrollmentsWithRelations(
  where: ReturnType<typeof and>,
  options?: { orderBy?: unknown; limit?: number; offset?: number },
): Promise<EnrollmentWithRelations[]> {
  const exec = getExecutor()
  const items = await exec
    .select()
    .from(enrollments)
    .where(where)
    .limit(options?.limit ?? 100)
    .offset(options?.offset ?? 0)

  const result: EnrollmentWithRelations[] = []

  for (const enrollment of items) {
    const [student, product, pricing] = await Promise.all([
      enrollment.studentId
        ? exec
            .select()
            .from(students)
            .where(eq(students.id, enrollment.studentId))
            .then((r) => r[0] ?? null)
        : null,
      enrollment.productId
        ? exec
            .select()
            .from(products)
            .where(eq(products.id, enrollment.productId))
            .then((r) => r[0] ?? null)
        : null,
      enrollment.productPricingId
        ? exec
            .select()
            .from(productPricings)
            .where(eq(productPricings.id, enrollment.productPricingId))
            .then((r) => r[0] ?? null)
        : null,
    ])

    let prices: (typeof productPrices.$inferSelect)[] = []
    if (pricing) {
      prices = await exec
        .select()
        .from(productPrices)
        .where(eq(productPrices.productPricingId, pricing.id))
    }

    result.push({
      ...enrollment,
      student: student ?? undefined,
      product: product ?? undefined,
      productPricing: pricing ? { ...pricing, prices } : undefined,
    })
  }

  return result
}
