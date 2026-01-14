import { Prisma, Teacher } from '@prisma/client'
import { v7 as uuidv7 } from 'uuid'

import prisma from '@/common/prisma'
import * as Entity from '@/entities/teacher.entity'

import { ITeacherRepo } from './teacher.contract'

export default class TeacherRepo implements ITeacherRepo {
  private toEntity(data: Teacher): Entity.Teacher {
    return {
      id: data.id,
      company_id: data.companyId,
      branch_id: data.branchId,
      status: data.status,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      birth_date: data.birthDate,
      biography: data.biography,
      specialty: data.specialty,
      created_at: data.createdAt,
      updated_at: data.updatedAt,
      deleted_at: data.deletedAt,
    }
  }

  async create(req: Entity.CreateTeacherReq): Promise<Entity.Teacher> {
    const data = await prisma.teacher.create({
      data: {
        id: req.id || uuidv7(),
        companyId: req.company_id,
        branchId: req.branch_id,
        status: req.status,
        name: req.name,
        email: req.email,
        phone: req.phone || '',
        address: req.address || '',
        birthDate: req.birth_date || '',
        biography: req.biography || '',
        specialty: req.specialty || '',
      },
    })
    return this.toEntity(data)
  }

  async update(req: Entity.UpdateTeacherReq): Promise<Entity.Teacher> {
    const data = await prisma.teacher.update({
      where: {
        id: req.id,
        companyId: req.company_id,
        deletedAt: null,
      },
      data: {
        branchId: req.branch_id,
        status: req.status,
        name: req.name,
        email: req.email,
        phone: req.phone,
        address: req.address,
        birthDate: req.birth_date,
        biography: req.biography,
        specialty: req.specialty,
      },
    })
    return this.toEntity(data)
  }

  async delete(id: string, companyId: string): Promise<void> {
    await prisma.teacher.update({
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

  async findById(id: string, companyId: string): Promise<Entity.Teacher | null> {
    const data = await prisma.teacher.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    })
    if (!data) return null
    return this.toEntity(data)
  }

  async findByEmail(email: string): Promise<Entity.Teacher | null> {
    const data = await prisma.teacher.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    })
    if (!data) return null
    return this.toEntity(data)
  }

  async findList(req: Entity.GetTeacherReq): Promise<Entity.TeacherList> {
    const { pagination = {}, q, company_id, branch_id } = req
    const { page = 1, per_page = 10 } = pagination
    const skip = (page - 1) * per_page
    const take = per_page

    const where: Prisma.TeacherWhereInput = {
      companyId: company_id,
      deletedAt: null,
    }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { specialty: { contains: q, mode: 'insensitive' } },
      ]
    }

    if (branch_id) {
      where.branchId = branch_id
    }

    const [items, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.teacher.count({ where }),
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
