import { Prisma } from '@prisma/client'

import * as Entity from '@/entities/enrollment.entity'

export const enrollmentIncludes = {
  student: true,
  product: true,
  productPricing: {
    include: {
      prices: true,
    },
  },
} satisfies Prisma.EnrollmentInclude

export type EnrollmentWithRelations = Prisma.EnrollmentGetPayload<{
  include: typeof enrollmentIncludes
}>

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
        prices: data.productPricing.prices.map((p) => ({
          id: p.id,
          pricing_id: p.productPricingId,
          currency: p.currency,
          price: p.price.toNumber(),
          started_at: p.startedAt,
          ended_at: p.endedAt,
          created_at: p.createdAt,
        })),
      }
    : undefined,
})
