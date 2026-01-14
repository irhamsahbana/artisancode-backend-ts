import { Prisma } from '@prisma/client'

import prisma from '@/common/prisma'
import * as Entity from '@/entities/company.entity'

import { ICompanyRepo } from './company.contract'

export default class CompanyRepo implements ICompanyRepo {
  async create(req: Entity.CreateCompanyReq): Promise<Entity.Company> {
    const status = req.status === 'inactive' ? 'inactive' : 'active'
    return await prisma.company.create({
      data: {
        name: req.name,
        status: status,
      },
    })
  }

  async findList(req: Entity.GetCompanyReq): Promise<Entity.CompanyList> {
    const { pagination = {}, q, accessible_company_id, ...rest } = req
    const { page = 1, per_page = 10 } = pagination
    const skip = (page - 1) * per_page
    const take = per_page

    const where: Prisma.CompanyWhereInput = {
      deletedAt: null,
      ...rest,
    }

    if (q) {
      where.name = {
        contains: q,
        mode: 'insensitive',
      }
    }

    if (accessible_company_id) {
      where.id = accessible_company_id
    } else if (req.ids) {
      where.id = {
        in: req.ids,
      }
    }

    const [items, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take,
      }),
      prisma.company.count({
        where,
      }),
    ])
    return {
      items,
      pagination: {
        total,
        page,
        per_page,
        last_page: Math.ceil(total / per_page),
      },
    }
  }

  async findById(req: Entity.GetCompanyReq): Promise<Entity.Company | null> {
    const where: Prisma.CompanyWhereInput = {
      id: req.id,
      deletedAt: null,
    }

    if (req.accessible_company_id) {
      where.id = req.accessible_company_id
      // If req.id is also provided, it must match. But if accessible_company_id is set, it overrides or must be equal.
      // If they are different, result is null (not found).
      if (req.id && req.id !== req.accessible_company_id) {
        return null
      }
    }

    return await prisma.company.findFirst({
      where,
    })
  }

  async update(req: Entity.UpdateCompanyReq): Promise<Entity.Company> {
    const status = req.status === 'inactive' ? 'inactive' : 'active'

    // Check access
    if (req.accessible_company_id && req.id !== req.accessible_company_id) {
      throw new Error('Company not found') // Or access denied
    }

    return await prisma.company.update({
      where: { id: req.id },
      data: {
        ...req,
        status: req.status ? status : undefined,
      },
    })
  }

  async delete(req: Entity.GetCompanyReq): Promise<void> {
    // Check access
    if (req.accessible_company_id && req.id !== req.accessible_company_id) {
      throw new Error('Company not found')
    }

    await prisma.company.update({
      where: { id: req.id },
      data: {
        deletedAt: new Date(),
      },
    })
  }
}
