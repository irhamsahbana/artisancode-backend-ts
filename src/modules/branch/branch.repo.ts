import { Branch, Prisma, Status } from '@prisma/client'

import prisma from '@/common/prisma'
import * as Entity from '@/entities/branch.entity'

import { IBranchRepo } from './branch.contract'

export default class BranchRepo implements IBranchRepo {
  private toEntity(data: Branch): Entity.Branch {
    return {
      id: data.id,
      company_id: data.companyId,
      name: data.name,
      city: data.city,
      capacity: data.capacity,
      description: data.description,
      address: data.address,
      phone: data.phone,
      email: data.email,
      head_coach: data.headCoach,
      status: data.status,
      created_at: data.createdAt,
      updated_at: data.updatedAt,
      deleted_at: data.deletedAt,
    }
  }

  async create(req: Entity.CreateBranchReq): Promise<Entity.Branch> {
    const data = await prisma.branch.create({
      data: {
        companyId: req.company_id,
        name: req.name,
        city: req.city,
        capacity: req.capacity,
        description: req.description,
        address: req.address,
        phone: req.phone,
        email: req.email,
        headCoach: req.head_coach,
        status: req.status as Status,
      },
    })
    return this.toEntity(data)
  }

  async update(req: Entity.UpdateBranchReq): Promise<Entity.Branch> {
    const data = await prisma.branch.update({
      where: {
        id: req.id,
        companyId: req.company_id,
        deletedAt: null,
      },
      data: {
        name: req.name,
        city: req.city,
        capacity: req.capacity,
        description: req.description,
        address: req.address,
        phone: req.phone,
        email: req.email,
        headCoach: req.head_coach,
        status: req.status as Status,
      },
    })
    return this.toEntity(data)
  }

  async delete(id: string, companyId: string): Promise<void> {
    await prisma.branch.update({
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

  async findById(id: string, companyId: string): Promise<Entity.Branch | null> {
    const data = await prisma.branch.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    })
    if (!data) return null
    return this.toEntity(data)
  }

  async findList(req: Entity.GetBranchReq): Promise<Entity.BranchList> {
    const { pagination = {}, q, company_id } = req
    const { page = 1, per_page = 10 } = pagination
    const skip = (page - 1) * per_page
    const take = per_page

    const where: Prisma.BranchWhereInput = {
      companyId: company_id,
      deletedAt: null,
    }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.branch.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.branch.count({ where }),
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
