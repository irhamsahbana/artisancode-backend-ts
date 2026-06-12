import { eq, and, isNull, sql } from 'drizzle-orm'

import { db } from '@/common/db'
import { enrollments, students } from '@/db/schema'
import * as Entity from '@/entities/enrollment.entity'

import { IEnrollmentRepo } from './enrollment.contract'
import {
  findEnrollmentWithRelations,
  findEnrollmentsWithRelations,
  toEnrollmentEntity,
} from './enrollment.mapper'

export default class EnrollmentRepo implements IEnrollmentRepo {
  async create(req: Entity.CreateEnrollmentReq): Promise<Entity.Enrollment> {
    const [row] = await db
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

    const data = await findEnrollmentWithRelations(row.id)
    if (!data) throw new Error('Enrollment not found')
    return toEnrollmentEntity(data)
  }

  async update(req: Entity.UpdateEnrollmentReq): Promise<Entity.Enrollment> {
    const [row] = await db
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

    const data = await findEnrollmentWithRelations(row.id)
    if (!data) throw new Error('Enrollment not found')
    return toEnrollmentEntity(data)
  }

  async delete(id: string, companyId: string): Promise<void> {
    await db
      .update(enrollments)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(enrollments.id, id),
          eq(enrollments.companyId, companyId),
          isNull(enrollments.deletedAt),
        ),
      )
  }

  async findById(id: string, companyId: string): Promise<Entity.Enrollment | null> {
    const data = await findEnrollmentWithRelations(id, companyId)
    if (!data) return null
    return toEnrollmentEntity(data)
  }

  async findByStudentAndProgram(
    studentId: string,
    programId: string,
    companyId: string,
  ): Promise<Entity.Enrollment | null> {
    // First check if student has active/on_leave status
    const [student] = await db
      .select()
      .from(students)
      .where(
        and(
          eq(students.id, studentId),
          eq(students.companyId, companyId),
          isNull(students.deletedAt),
        ),
      )
      .limit(1)

    if (!student || (student.status !== 'active' && student.status !== 'on_leave')) {
      return null
    }

    const conditions = [
      eq(enrollments.studentId, studentId),
      eq(enrollments.productId, programId),
      eq(enrollments.companyId, companyId),
      isNull(enrollments.deletedAt),
    ]

    const data = await findEnrollmentsWithRelations(and(...conditions), { limit: 1 })
    if (data.length === 0) return null
    return toEnrollmentEntity(data[0])
  }

  async findActiveByStudentAndProgram(
    studentId: string,
    programId: string,
    companyId: string,
  ): Promise<Entity.Enrollment | null> {
    const conditions = [
      eq(enrollments.studentId, studentId),
      eq(enrollments.productId, programId),
      eq(enrollments.companyId, companyId),
      eq(enrollments.status, 'active'),
      isNull(enrollments.deletedAt),
    ]

    const data = await findEnrollmentsWithRelations(and(...conditions), { limit: 1 })
    if (data.length === 0) return null
    return toEnrollmentEntity(data[0])
  }

  async findActiveByStudent(studentId: string, companyId: string): Promise<Entity.Enrollment[]> {
    const conditions = [
      eq(enrollments.studentId, studentId),
      eq(enrollments.companyId, companyId),
      eq(enrollments.status, 'active'),
      isNull(enrollments.deletedAt),
    ]

    const data = await findEnrollmentsWithRelations(and(...conditions))

    // Attach schedules to program
    return data.map((item) => {
      const entity = toEnrollmentEntity(item)
      if (entity.program) {
        // We need to fetch schedules separately
        // For now, return without schedules - can be added later if needed
        entity.program.schedules = []
      }
      return entity
    })
  }

  async findList(req: Entity.GetEnrollmentReq): Promise<Entity.EnrollmentList> {
    const { pagination = {}, company_id, branch_id, student_id, program_id, pricing_id } = req
    const { page = 1, per_page = 10 } = pagination
    const offset = (page - 1) * per_page

    const conditions = [eq(enrollments.companyId, company_id), isNull(enrollments.deletedAt)]

    if (branch_id) {
      conditions.push(eq(enrollments.branchId, branch_id))
    }

    if (student_id) {
      conditions.push(eq(enrollments.studentId, student_id))
    }

    if (program_id) {
      conditions.push(eq(enrollments.productId, program_id))
    }

    if (pricing_id) {
      conditions.push(eq(enrollments.productPricingId, pricing_id))
    }

    const where = and(...conditions)

    const [items, countResult] = await Promise.all([
      findEnrollmentsWithRelations(where, { limit: per_page, offset }),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(enrollments)
        .where(where),
    ])

    const total = countResult[0]?.count ?? 0

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
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.productId, programId),
          eq(enrollments.companyId, companyId),
          eq(enrollments.status, 'active'),
          isNull(enrollments.deletedAt),
        ),
      )
    return result.count
  }

  async countActiveByPricing(pricingId: string, companyId: string): Promise<number> {
    const [result] = await db
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
}
