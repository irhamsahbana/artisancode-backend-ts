import { eq, and, or, ilike, isNull, gt, lte, sql } from 'drizzle-orm'

import { db } from '@/common/db'
import { students } from '@/db/schema'
import * as Entity from '@/entities/student.entity'

import { IStudentRepo } from './student.contract'

export default class StudentRepo implements IStudentRepo {
  private toEntity(data: typeof students.$inferSelect): Entity.Student {
    return {
      id: data.id,
      company_id: data.companyId,
      branch_id: data.branchId,
      first_name: data.firstName,
      last_name: data.lastName,
      gender: data.gender,
      date_of_birth: data.dateOfBirth,
      birth_place: data.birthPlace,
      email: data.email,
      address: data.address,
      photo_url: data.photoUrl,
      parent_name: data.parentName,
      parent_phone: data.parentPhone,
      parent_email: data.parentEmail,
      emergency_contact_phone: data.emergencyContactPhone,
      blood_type: data.bloodType,
      medical_notes: data.medicalNotes,
      status: data.status,
      created_at: data.createdAt,
      updated_at: data.updatedAt,
      deleted_at: data.deletedAt,
    }
  }

  async create(req: Entity.CreateStudentReq): Promise<Entity.Student> {
    const [row] = await db
      .insert(students)
      .values({
        companyId: req.company_id,
        branchId: req.branch_id,
        firstName: req.first_name,
        lastName: req.last_name,
        gender: req.gender,
        dateOfBirth: req.date_of_birth,
        birthPlace: req.birth_place || '',
        email: req.email,
        address: req.address || '',
        photoUrl: req.photo_url || '',
        parentName: req.parent_name || '',
        parentPhone: req.parent_phone || '',
        parentEmail: req.parent_email || '',
        emergencyContactPhone: req.emergency_contact_phone || '',
        bloodType: req.blood_type || '',
        medicalNotes: req.medical_notes || '',
        status: (req.status as Entity.StudentStatus) || 'active',
      })
      .returning()
    return this.toEntity(row)
  }

  async update(req: Entity.UpdateStudentReq): Promise<Entity.Student> {
    const [row] = await db
      .update(students)
      .set({
        branchId: req.branch_id,
        firstName: req.first_name,
        lastName: req.last_name,
        gender: req.gender,
        dateOfBirth: req.date_of_birth,
        birthPlace: req.birth_place,
        email: req.email,
        address: req.address,
        photoUrl: req.photo_url,
        parentName: req.parent_name,
        parentPhone: req.parent_phone,
        parentEmail: req.parent_email,
        emergencyContactPhone: req.emergency_contact_phone,
        bloodType: req.blood_type,
        medicalNotes: req.medical_notes,
        status: req.status as Entity.StudentStatus,
      })
      .where(
        and(
          eq(students.id, req.id),
          eq(students.companyId, req.company_id),
          isNull(students.deletedAt),
        ),
      )
      .returning()
    return this.toEntity(row)
  }

  async delete(id: string, companyId: string): Promise<void> {
    await db
      .update(students)
      .set({ deletedAt: new Date() })
      .where(
        and(eq(students.id, id), eq(students.companyId, companyId), isNull(students.deletedAt)),
      )
  }

  async findById(id: string, companyId: string): Promise<Entity.Student | null> {
    const [row] = await db
      .select()
      .from(students)
      .where(
        and(eq(students.id, id), eq(students.companyId, companyId), isNull(students.deletedAt)),
      )
      .limit(1)
    return row ? this.toEntity(row) : null
  }

  async findByEmail(email: string): Promise<Entity.Student | null> {
    const [row] = await db
      .select()
      .from(students)
      .where(and(eq(students.email, email), isNull(students.deletedAt)))
      .limit(1)
    return row ? this.toEntity(row) : null
  }

  async findList(req: Entity.GetStudentReq): Promise<Entity.StudentList> {
    const { pagination = {}, q, company_id, branch_id, age } = req
    const { page = 1, per_page = 10 } = pagination
    const offset = (page - 1) * per_page

    const conditions = [eq(students.companyId, company_id), isNull(students.deletedAt)]

    if (q) {
      const qCondition = or(
        ilike(students.firstName, `%${q}%`),
        ilike(students.lastName, `%${q}%`),
        ilike(students.email, `%${q}%`),
      )
      if (qCondition) conditions.push(qCondition)
    }

    if (branch_id) {
      conditions.push(eq(students.branchId, branch_id))
    }

    if (age !== undefined) {
      const today = new Date()
      const maxDate = new Date(today.getFullYear() - age, today.getMonth(), today.getDate())
      const minDate = new Date(today.getFullYear() - age - 1, today.getMonth(), today.getDate())
      const ageCondition = and(
        gt(students.dateOfBirth, minDate),
        lte(students.dateOfBirth, maxDate),
      )
      if (ageCondition) conditions.push(ageCondition)
    }

    const where = and(...conditions)

    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(students)
        .where(where)
        .orderBy(sql`${students.createdAt} desc`)
        .limit(per_page)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(students)
        .where(where),
    ])

    const total = countResult[0]?.count ?? 0

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
