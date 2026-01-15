import { Prisma, Student, Status } from '@prisma/client'

import prisma from '@/common/prisma'
import * as Entity from '@/entities/student.entity'

import { IStudentRepo } from './student.contract'

export default class StudentRepo implements IStudentRepo {
  private toEntity(data: Student): Entity.Student {
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
    const data = await prisma.student.create({
      data: {
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
        status: (req.status as Status) || 'active',
      },
    })
    return this.toEntity(data)
  }

  async update(req: Entity.UpdateStudentReq): Promise<Entity.Student> {
    const data = await prisma.student.update({
      where: {
        id: req.id,
        companyId: req.company_id,
        deletedAt: null,
      },
      data: {
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
        status: req.status as Status,
      },
    })
    return this.toEntity(data)
  }

  async delete(id: string, companyId: string): Promise<void> {
    await prisma.student.update({
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

  async findById(id: string, companyId: string): Promise<Entity.Student | null> {
    const data = await prisma.student.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    })
    if (!data) return null
    return this.toEntity(data)
  }

  async findByEmail(email: string): Promise<Entity.Student | null> {
    const data = await prisma.student.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    })
    if (!data) return null
    return this.toEntity(data)
  }

  async findList(req: Entity.GetStudentReq): Promise<Entity.StudentList> {
    const { pagination = {}, q, company_id, branch_id, age } = req
    const { page = 1, per_page = 10 } = pagination
    const skip = (page - 1) * per_page
    const take = per_page

    const where: Prisma.StudentWhereInput = {
      companyId: company_id,
      deletedAt: null,
    }

    if (q) {
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ]
    }

    if (branch_id) {
      where.branchId = branch_id
    }

    if (age !== undefined) {
      const today = new Date()
      const maxDate = new Date(today.getFullYear() - age, today.getMonth(), today.getDate())
      const minDate = new Date(today.getFullYear() - age - 1, today.getMonth(), today.getDate())

      where.dateOfBirth = {
        gt: minDate,
        lte: maxDate,
      }
    }

    const [items, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.student.count({ where }),
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
