import { EnrollmentStatus, Prisma } from '@prisma/client'

import prisma from '@/common/prisma'
import * as Entity from '@/entities/enrollment.entity'

import { IEnrollmentRepo } from './enrollment.contract'

export default class EnrollmentRepo implements IEnrollmentRepo {
  private toEntity(data: EnrollmentWithRelations): Entity.Enrollment {
    return {
      id: data.id,
      company_id: data.companyId,
      branch_id: data.branchId,
      student_id: data.studentId,
      program_id: data.productId,
      pricing_id: data.productPricingId,
      status: data.status,
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
              is_active: p.isActive,
              created_at: p.createdAt,
            })),
          }
        : undefined,
    }
  }

  async create(req: Entity.CreateEnrollmentReq): Promise<Entity.Enrollment> {
    const data = await prisma.enrollment.create({
      data: {
        companyId: req.company_id,
        branchId: req.branch_id,
        studentId: req.student_id,
        productId: req.program_id,
        productPricingId: req.pricing_id,
        status: (req.status as EnrollmentStatus) || 'active',
      },
      include: enrollmentIncludes,
    })
    return this.toEntity(data)
  }

  async update(req: Entity.UpdateEnrollmentReq): Promise<Entity.Enrollment> {
    const data = await prisma.enrollment.update({
      where: {
        id: req.id,
        companyId: req.company_id,
        deletedAt: null,
      },
      data: {
        branchId: req.branch_id,
        studentId: req.student_id,
        productId: req.program_id,
        productPricingId: req.pricing_id,
        status: req.status as EnrollmentStatus,
      },
      include: enrollmentIncludes,
    })
    return this.toEntity(data)
  }

  async delete(id: string, companyId: string): Promise<void> {
    await prisma.enrollment.update({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    })
  }

  async findById(id: string, companyId: string): Promise<Entity.Enrollment | null> {
    const data = await prisma.enrollment.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: enrollmentIncludes,
    })
    if (!data) return null
    return this.toEntity(data)
  }

  async findList(req: Entity.GetEnrollmentReq): Promise<Entity.EnrollmentList> {
    const { pagination = {}, company_id, branch_id, student_id, program_id, pricing_id } = req
    const { page = 1, per_page = 10 } = pagination
    const skip = (page - 1) * per_page
    const take = per_page

    const where: Prisma.EnrollmentWhereInput = {
      companyId: company_id,
      deletedAt: null,
    }

    if (branch_id) {
      where.branchId = branch_id
    }

    if (student_id) {
      where.studentId = student_id
    }

    if (program_id) {
      where.productId = program_id
    }

    if (pricing_id) {
      where.productPricingId = pricing_id
    }

    const [items, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: enrollmentIncludes,
      }),
      prisma.enrollment.count({ where }),
    ])

    return {
      items: items.map((item) => this.toEntity(item)),
      pagination: {
        total,
        page,
        per_page,
        last_page: Math.ceil(total / per_page),
      },
    }
  }

  async countActiveByProgram(programId: string, companyId: string): Promise<number> {
    return prisma.enrollment.count({
      where: {
        productId: programId,
        companyId,
        status: 'active',
        deletedAt: null,
      },
    })
  }

  async countActiveByPricing(pricingId: string, companyId: string): Promise<number> {
    return prisma.enrollment.count({
      where: {
        productPricingId: pricingId,
        companyId,
        status: 'active',
        deletedAt: null,
      },
    })
  }
}

type EnrollmentWithRelations = Prisma.EnrollmentGetPayload<{
  include: typeof enrollmentIncludes
}>

const enrollmentIncludes = {
  student: true,
  product: true,
  productPricing: {
    include: {
      prices: true,
    },
  },
} satisfies Prisma.EnrollmentInclude
