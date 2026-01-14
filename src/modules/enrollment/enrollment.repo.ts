import { Prisma, Status, BillingType } from '@prisma/client'

import prisma from '@/common/prisma'
import * as Entity from '@/entities/enrollment.entity'

import { IEnrollmentRepo } from './enrollment.contract'

export default class EnrollmentRepo implements IEnrollmentRepo {
  private toEntity(
    data: Prisma.EnrollmentGetPayload<{
      include: {
        student: true
        program: {
          include: {
            branch: true
          }
        }
      }
    }>,
  ): Entity.Enrollment {
    return {
      id: data.id,
      company_id: data.companyId,
      branch_id: data.branchId,
      student_id: data.studentId,
      program_id: data.programId,
      enrollment_date: data.enrollmentDate,
      status: data.status,
      billing_type: data.billingType,
      billed_at: data.billedAt,
      next_payment_date: data.nextPaymentDate,
      created_at: data.createdAt,
      updated_at: data.updatedAt,
      deleted_at: data.deletedAt,
      student: data.student
        ? {
            id: data.student.id,
            company_id: data.student.companyId,
            branch_id: data.student.branchId,
            age_category_id: data.student.ageCategoryId,
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
      program: data.program
        ? {
            id: data.program.id,
            company_id: data.program.companyId,
            branch_id: data.program.branchId,
            age_category_id: data.program.ageCategoryId,
            name: data.program.name,
            description: data.program.description,
            capacity: data.program.capacity,
            duration: data.program.duration,
            start_date: data.program.startDate,
            end_date: data.program.endDate,
            status: data.program.status,
            created_at: data.program.createdAt,
            updated_at: data.program.updatedAt,
            deleted_at: data.program.deletedAt,
            branch: data.program.branch
              ? {
                  id: data.program.branch.id,
                  company_id: data.program.branch.companyId,
                  name: data.program.branch.name,
                  city: data.program.branch.city,
                  capacity: data.program.branch.capacity,
                  description: data.program.branch.description,
                  address: data.program.branch.address,
                  phone: data.program.branch.phone,
                  email: data.program.branch.email,
                  head_coach: data.program.branch.headCoach,
                  status: data.program.branch.status,
                  created_at: data.program.branch.createdAt,
                  updated_at: data.program.branch.updatedAt,
                  deleted_at: data.program.branch.deletedAt,
                }
              : undefined,
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
        programId: req.program_id,
        enrollmentDate: req.enrollment_date || new Date(),
        status: (req.status as Status) || 'active',
        billingType: (req.billing_type as BillingType) || 'one_time',
        billedAt: req.billed_at || 0,
        nextPaymentDate: req.next_payment_date,
      },
      include: {
        student: true,
        program: {
          include: {
            branch: true,
          },
        },
      },
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
        programId: req.program_id,
        enrollmentDate: req.enrollment_date,
        status: req.status as Status,
        billingType: req.billing_type as BillingType,
        billedAt: req.billed_at,
        nextPaymentDate: req.next_payment_date,
      },
      include: {
        student: true,
        program: {
          include: {
            branch: true,
          },
        },
      },
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
      include: {
        student: true,
        program: {
          include: {
            branch: true,
            // teachers: true, // Note: Program to Teachers relation needs to be defined if required, currently not in schema directly?
            // Actually schema says Program has teacherPrograms TeacherProgram[], not teachers directly.
            // But user provided reference code has teachers: true.
            // If the schema `Program` has `teacherPrograms`, we need to see how to include them.
            // For now I'll stick to what is safely available: branch.
          },
        },
      },
    })
    if (!data) return null
    return this.toEntity(data)
  }

  async findList(req: Entity.GetEnrollmentReq): Promise<Entity.EnrollmentList> {
    const { pagination = {}, company_id, branch_id, student_id, program_id } = req
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
      where.programId = program_id
    }

    const [items, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          student: true,
          program: {
            include: {
              branch: true,
            },
          },
        },
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
}
