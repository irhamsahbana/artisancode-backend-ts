import { Prisma, Program } from '@prisma/client'

import prisma from '@/common/prisma'
import * as Entity from '@/entities/program.entity'

import { IProgramRepo } from './program.contract'

export default class ProgramRepo implements IProgramRepo {
  private toEntity(data: Program): Entity.Program {
    return {
      id: data.id,
      company_id: data.companyId,
      branch_id: data.branchId,
      age_category_id: data.ageCategoryId,
      name: data.name,
      description: data.description,
      capacity: data.capacity,
      duration: data.duration,
      start_date: data.startDate,
      end_date: data.endDate,
      status: data.status,
      created_at: data.createdAt,
      updated_at: data.updatedAt,
      deleted_at: data.deletedAt,
    }
  }

  async create(req: Entity.CreateProgramReq): Promise<Entity.Program> {
    const data = await prisma.program.create({
      data: {
        companyId: req.company_id,
        branchId: req.branch_id,
        ageCategoryId: req.age_category_id,
        name: req.name,
        description: req.description || '',
        capacity: req.capacity || 100,
        duration: req.duration || '',
        startDate: req.start_date || new Date(),
        endDate: req.end_date,
        status: req.status || 'active',
      },
    })
    return this.toEntity(data)
  }

  async update(req: Entity.UpdateProgramReq): Promise<Entity.Program> {
    const data = await prisma.program.update({
      where: {
        id: req.id,
        companyId: req.company_id,
        deletedAt: null,
      },
      data: {
        branchId: req.branch_id,
        ageCategoryId: req.age_category_id,
        name: req.name,
        description: req.description,
        capacity: req.capacity,
        duration: req.duration,
        startDate: req.start_date,
        endDate: req.end_date,
        status: req.status,
      },
    })
    return this.toEntity(data)
  }

  async delete(id: string, companyId: string): Promise<void> {
    await prisma.program.update({
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

  async findById(id: string, companyId: string): Promise<Entity.Program | null> {
    const data = await prisma.program.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    })
    if (!data) return null
    return this.toEntity(data)
  }

  async findList(req: Entity.GetProgramReq): Promise<Entity.ProgramList> {
    const { pagination = {}, q, company_id, branch_id } = req
    const { page = 1, per_page = 10 } = pagination
    const skip = (page - 1) * per_page
    const take = per_page

    const where: Prisma.ProgramWhereInput = {
      companyId: company_id,
      deletedAt: null,
    }

    if (q) {
      where.name = { contains: q, mode: 'insensitive' }
    }

    if (branch_id) {
      where.branchId = branch_id
    }

    const [items, total] = await Promise.all([
      prisma.program.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.program.count({ where }),
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
