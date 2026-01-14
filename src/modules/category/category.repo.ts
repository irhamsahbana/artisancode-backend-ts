import { Category, Prisma, Status } from '@prisma/client'

import prisma from '@/common/prisma'
import * as Entity from '@/entities/category.entity'

import { ICategoryRepo } from './category.contract'

export default class CategoryRepo implements ICategoryRepo {
  private toEntity(data: Category): Entity.Category {
    return {
      id: data.id,
      company_id: data.companyId,
      parent_id: data.parentId,
      group: data.group,
      name: data.name,
      status: data.status,
      created_at: data.createdAt,
      updated_at: data.updatedAt,
      deleted_at: data.deletedAt,
    }
  }

  async create(req: Entity.CreateCategoryReq): Promise<Entity.Category> {
    const data = await prisma.category.create({
      data: {
        companyId: req.company_id,
        parentId: req.parent_id,
        group: req.group || '',
        name: req.name,
        status: req.status as Status,
      },
    })
    return this.toEntity(data)
  }

  async update(req: Entity.UpdateCategoryReq): Promise<Entity.Category> {
    const data = await prisma.category.update({
      where: {
        id: req.id,
        companyId: req.company_id,
        deletedAt: null,
      },
      data: {
        parentId: req.parent_id,
        group: req.group,
        name: req.name,
        status: req.status as Status,
      },
    })
    return this.toEntity(data)
  }

  async delete(id: string, companyId: string): Promise<void> {
    await prisma.category.update({
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

  async findById(id: string, companyId: string): Promise<Entity.Category | null> {
    const data = await prisma.category.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    })
    if (!data) return null
    return this.toEntity(data)
  }

  async findList(req: Entity.GetCategoryReq): Promise<Entity.CategoryList> {
    const { pagination = {}, q, company_id, group } = req
    const { page = 1, per_page = 10 } = pagination
    const skip = (page - 1) * per_page
    const take = per_page

    const where: Prisma.CategoryWhereInput = {
      companyId: company_id,
      deletedAt: null,
    }

    if (q) {
      where.name = { contains: q, mode: 'insensitive' }
    }

    if (group) {
      where.group = group
    }

    const [items, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.category.count({ where }),
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
