import { BillingCycle, EnrollmentStatus, Prisma } from '@prisma/client'

import prisma from '@/common/prisma'
import * as Entity from '@/entities/enrollment.entity'

import { IEnrollmentRepo } from './enrollment.contract'
import { enrollmentIncludes, toEnrollmentEntity } from './enrollment.mapper'

export default class EnrollmentRepo implements IEnrollmentRepo {
  async create(req: Entity.CreateEnrollmentReq): Promise<Entity.Enrollment> {
    const data = await prisma.enrollment.create({
      data: {
        companyId: req.company_id,
        branchId: req.branch_id,
        studentId: req.student_id,
        productId: req.program_id,
        productPricingId: req.pricing_id,
        currency: req.currency,
        status: (req.status as EnrollmentStatus) || 'active',
        billingCycle: (req.billing_cycle as BillingCycle) || 'monthly',
        nextBillingDate: req.next_billing_date,
        autoRenew: req.auto_renew,
        createdAt: req.enrollment_date,
      },
      include: enrollmentIncludes,
    })
    return toEnrollmentEntity(data)
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
        currency: req.currency,
        status: req.status as EnrollmentStatus,
      },
      include: enrollmentIncludes,
    })
    return toEnrollmentEntity(data)
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
      where: { id, companyId, deletedAt: null },
      include: enrollmentIncludes,
    })
    if (!data) return null
    return toEnrollmentEntity(data)
  }

  async findByStudentAndProgram(
    studentId: string,
    programId: string,
    companyId: string,
  ): Promise<Entity.Enrollment | null> {
    const data = await prisma.enrollment.findFirst({
      where: {
        studentId,
        productId: programId,
        companyId,
        deletedAt: null,
        student: {
          status: { in: ['active', 'on_leave'] },
        },
      },
      include: enrollmentIncludes,
    })
    if (!data) return null
    return toEnrollmentEntity(data)
  }

  async findActiveByStudentAndProgram(
    studentId: string,
    programId: string,
    companyId: string,
  ): Promise<Entity.Enrollment | null> {
    const data = await prisma.enrollment.findFirst({
      where: {
        studentId,
        productId: programId,
        companyId,
        status: 'active',
        deletedAt: null,
      },
      include: enrollmentIncludes,
    })
    if (!data) return null
    return toEnrollmentEntity(data)
  }

  async findActiveByStudent(studentId: string, companyId: string): Promise<Entity.Enrollment[]> {
    const data = await prisma.enrollment.findMany({
      where: {
        studentId,
        companyId,
        status: 'active',
        deletedAt: null,
      },
      include: {
        ...enrollmentIncludes,
        product: {
          include: {
            productSchedules: true,
          },
        },
      },
    })

    // We need to cast here because the include type is slightly different (includes productSchedules)
    // but our toEntity handles the base enrollment structure.
    // Ideally we should update toEntity to map schedules if needed, but for now we just need the list.
    return data.map((item) => {
      const entity = toEnrollmentEntity(item)
      // Manually attach schedules if available, though toEntity might not map them by default
      if (item.product && item.product.productSchedules) {
        if (entity.program) {
          entity.program.schedules = item.product.productSchedules.map((s) => ({
            id: s.id,
            program_id: s.productId,
            day: s.day,
            start_time: s.startTime,
            end_time: s.endTime,
            created_at: s.createdAt,
            updated_at: s.updatedAt,
          }))
        }
      }
      return entity
    })
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
      items: items.map((item) => toEnrollmentEntity(item)),
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
