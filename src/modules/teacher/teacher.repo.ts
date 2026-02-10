import { Prisma } from '@prisma/client'
import { v7 as uuidv7 } from 'uuid'

import prisma from '@/common/prisma'
import * as Entity from '@/entities/teacher.entity'

import { ITeacherRepo } from './teacher.contract'
import { toTeacherEntity } from './teacher.mapper'

export default class TeacherRepo implements ITeacherRepo {
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
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    return toTeacherEntity(data)
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
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    return toTeacherEntity(data)
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
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    if (!data) return null
    return toTeacherEntity(data)
  }

  async findByEmail(email: string): Promise<Entity.Teacher | null> {
    const data = await prisma.teacher.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    })
    if (!data) return null
    return toTeacherEntity(data)
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
        include: {
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.teacher.count({ where }),
    ])

    return {
      items: items.map((item) => toTeacherEntity(item)),
      pagination: {
        total,
        page,
        per_page,
        last_page: Math.ceil(total / per_page),
      },
    }
  }
}
