import {
  Prisma,
  Product,
  ProductSchedule,
  ProductPricing,
  ProductPrice,
  TeacherProduct,
  Teacher,
} from '@prisma/client'

import prisma from '@/common/prisma'
import * as Entity from '@/entities/program.entity'

import { IProgramRepo } from './program.contract'

type ProductWithRelations = Product & {
  productSchedules: ProductSchedule[]
  pricings: (ProductPricing & {
    prices: ProductPrice[]
  })[]
  teacherProducts: (TeacherProduct & {
    teacher: Teacher
  })[]
}

export default class ProgramRepo implements IProgramRepo {
  private toEntity(data: ProductWithRelations): Entity.Program {
    return {
      id: data.id,
      company_id: data.companyId,
      branch_id: data.branchId,
      name: data.name,
      description: data.description,
      capacity: data.capacity,
      status: data.status,
      created_at: data.createdAt,
      updated_at: data.updatedAt,
      deleted_at: data.deletedAt,
      schedules: data.productSchedules?.map((s) => ({
        id: s.id,
        program_id: s.productId,
        day: s.day,
        start_time: s.startTime,
        end_time: s.endTime,
        created_at: s.createdAt,
        updated_at: s.updatedAt,
      })),
      pricings: data.pricings?.map((p) => ({
        id: p.id,
        program_id: p.productId,
        name: p.name,
        description: p.description,
        is_active: p.isActive,
        created_at: p.createdAt,
        updated_at: p.updatedAt,
        prices: p.prices?.map((price) => ({
          id: price.id,
          pricing_id: price.productPricingId,
          currency: price.currency,
          price: price.price.toNumber(),
          started_at: price.startedAt,
          ended_at: price.endedAt,
          is_active: price.isActive,
          created_at: price.createdAt,
        })),
      })),
      teachers: data.teacherProducts?.map((tp) => ({
        id: tp.teacher.id,
        name: tp.teacher.name,
        email: tp.teacher.email,
        specialty: tp.teacher.specialty,
      })),
    }
  }

  async create(req: Entity.CreateProgramReq): Promise<Entity.Program> {
    const data = await prisma.product.create({
      data: {
        companyId: req.company_id,
        branchId: req.branch_id,
        name: req.name,
        description: req.description || '',
        capacity: req.capacity || 0,
        status: req.status || 'active',
        productSchedules: {
          create: req.schedules?.map((s) => ({
            day: s.day || '',
            startTime: s.start_time || '',
            endTime: s.end_time || '',
          })),
        },
        pricings: {
          create: req.pricings?.map((p) => ({
            name: p.name,
            description: p.description || '',
            prices: {
              create: p.prices.map((price) => ({
                currency: price.currency,
                price: price.price,
                startedAt: price.started_at || new Date(),
                endedAt: price.ended_at,
              })),
            },
          })),
        },
      },
      include: {
        productSchedules: true,
        pricings: {
          where: { deletedAt: null },
          include: {
            prices: true,
          },
        },
        teacherProducts: {
          include: {
            teacher: true,
          },
        },
      },
    })
    return this.toEntity(data)
  }

  async update(req: Entity.UpdateProgramReq): Promise<Entity.Program> {
    const { id, company_id, ...rest } = req
    const data = await prisma.product.update({
      where: {
        id: id,
        companyId: company_id,
        deletedAt: null,
      },
      data: {
        branchId: rest.branch_id,
        name: rest.name,
        description: rest.description,
        capacity: rest.capacity,
        status: rest.status,
      },
      include: {
        productSchedules: true,
        pricings: {
          where: { deletedAt: null },
          include: {
            prices: true,
          },
        },
        teacherProducts: {
          include: {
            teacher: true,
          },
        },
      },
    })
    return this.toEntity(data)
  }

  async updateAll(req: Entity.UpdateProgramAllReq): Promise<Entity.Program> {
    const { id, company_id, branch_id, schedules, pricings, teachers, ...rest } = req

    let scheduleOps: Prisma.ProductUpdateInput['productSchedules'] = undefined
    if (schedules) {
      const idsToKeep = schedules.filter((s) => s.id).map((s) => s.id as string)

      const newSchedules = schedules.filter((s) => !s.id)
      const updateSchedules = schedules.filter((s) => s.id)

      scheduleOps = {
        deleteMany: {
          id: { notIn: idsToKeep },
        },
        create: newSchedules.map((s) => ({
          day: s.day || '',
          startTime: s.start_time || '',
          endTime: s.end_time || '',
        })),
        update: updateSchedules.map((s) => ({
          where: { id: s.id as string },
          data: {
            day: s.day,
            startTime: s.start_time,
            endTime: s.end_time,
          },
        })),
      }
    }

    let pricingOps: Prisma.ProductUpdateInput['pricings'] = undefined
    if (pricings) {
      pricingOps = {
        updateMany: {
          where: { deletedAt: null },
          data: { deletedAt: new Date() },
        },
        create: pricings.map((p) => ({
          name: p.name,
          description: p.description || '',
          prices: {
            create: p.prices.map((price) => ({
              currency: price.currency,
              price: price.price,
              startedAt: price.started_at || new Date(),
              endedAt: price.ended_at,
            })),
          },
        })),
      }
    }

    let teacherOps: Prisma.ProductUpdateInput['teacherProducts'] = undefined
    if (teachers) {
      teacherOps = {
        deleteMany: {},
        create: teachers.map((tId) => ({
          teacherId: tId,
        })),
      }
    }

    const data = await prisma.product.update({
      where: {
        id: id,
        companyId: company_id,
        deletedAt: null,
      },
      data: {
        ...rest,
        branchId: branch_id,
        productSchedules: scheduleOps,
        pricings: pricingOps,
        teacherProducts: teacherOps,
      },
      include: {
        productSchedules: true,
        pricings: {
          where: { deletedAt: null },
          include: {
            prices: true,
          },
        },
        teacherProducts: {
          include: {
            teacher: true,
          },
        },
      },
    })
    return this.toEntity(data)
  }

  async delete(id: string, companyId: string): Promise<void> {
    await prisma.product.update({
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
    const data = await prisma.product.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        productSchedules: true,
        pricings: {
          where: { deletedAt: null },
          include: {
            prices: true,
          },
        },
        teacherProducts: {
          include: {
            teacher: true,
          },
        },
      },
    })
    if (!data) return null
    return this.toEntity(data)
  }

  async findByName(
    name: string,
    companyId: string,
    branchId?: string | null,
  ): Promise<Entity.Program | null> {
    const where: Prisma.ProductWhereInput = {
      companyId,
      name: { equals: name, mode: 'insensitive' },
      deletedAt: null,
    }

    if (branchId !== undefined) {
      where.branchId = branchId
    }

    const data = await prisma.product.findFirst({
      where,
      include: {
        productSchedules: true,
        pricings: {
          where: { deletedAt: null },
          include: {
            prices: true,
          },
        },
        teacherProducts: {
          include: {
            teacher: true,
          },
        },
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

    const where: Prisma.ProductWhereInput = {
      companyId: company_id,
      deletedAt: null,
    }

    if (q) {
      where.name = { contains: q, mode: 'insensitive' }
    }

    if (branch_id) {
      where.OR = [{ branchId: branch_id }, { branchId: null }]
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          productSchedules: true,
          pricings: {
            where: { deletedAt: null },
            include: {
              prices: true,
            },
          },
          teacherProducts: {
            include: {
              teacher: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
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

  async addSchedule(req: Entity.AddScheduleReq): Promise<Entity.ProgramSchedule> {
    const data = await prisma.productSchedule.create({
      data: {
        productId: req.program_id,
        day: req.day || '',
        startTime: req.start_time || '',
        endTime: req.end_time || '',
      },
    })
    return {
      id: data.id,
      program_id: data.productId,
      day: data.day,
      start_time: data.startTime,
      end_time: data.endTime,
      created_at: data.createdAt,
      updated_at: data.updatedAt,
    }
  }

  async addPricing(req: Entity.AddPricingReq): Promise<Entity.ProgramPricing> {
    const data = await prisma.productPricing.create({
      data: {
        productId: req.program_id,
        name: req.name,
        description: req.description || '',
        prices: {
          create: req.prices.map((p) => ({
            currency: p.currency,
            price: p.price,
            startedAt: p.started_at || new Date(),
            endedAt: p.ended_at,
          })),
        },
      },
      include: {
        prices: true,
      },
    })
    return {
      id: data.id,
      program_id: data.productId,
      name: data.name,
      description: data.description,
      is_active: data.isActive,
      created_at: data.createdAt,
      updated_at: data.updatedAt,
      prices: data.prices.map((p) => ({
        id: p.id,
        pricing_id: p.productPricingId,
        currency: p.currency,
        price: p.price.toNumber(),
        started_at: p.startedAt,
        ended_at: p.endedAt,
        is_active: p.isActive,
        created_at: p.createdAt,
      })),
    }
  }

  async addPrice(req: Entity.AddPriceReq): Promise<Entity.ProgramPrice> {
    const data = await prisma.productPrice.create({
      data: {
        productPricingId: req.pricing_id,
        currency: req.currency,
        price: req.price,
        startedAt: req.started_at || new Date(),
        endedAt: req.ended_at,
        isActive: true,
      },
    })
    return {
      id: data.id,
      pricing_id: data.productPricingId,
      currency: data.currency,
      price: data.price.toNumber(),
      started_at: data.startedAt,
      ended_at: data.endedAt,
      is_active: data.isActive,
      created_at: data.createdAt,
    }
  }

  async updatePrice(req: Entity.UpdatePriceReq): Promise<Entity.ProgramPrice> {
    const data = await prisma.productPrice.update({
      where: {
        id: req.price_id,
        productPricing: {
          id: req.pricing_id,
          productId: req.program_id,
          product: {
            companyId: req.company_id,
          },
        },
      },
      data: {
        price: req.price,
        startedAt: req.started_at,
        endedAt: req.ended_at,
      },
    })
    return {
      id: data.id,
      pricing_id: data.productPricingId,
      currency: data.currency,
      price: data.price.toNumber(),
      started_at: data.startedAt,
      ended_at: data.endedAt,
      is_active: data.isActive,
      created_at: data.createdAt,
    }
  }

  async deleteSchedule(programId: string, scheduleId: string, companyId: string): Promise<void> {
    // Using deleteMany to ensure ownership via product.companyId
    // deleteMany returns { count: n }, doesn't throw if not found
    await prisma.productSchedule.deleteMany({
      where: {
        id: scheduleId,
        productId: programId,
        product: {
          companyId: companyId,
        },
      },
    })
  }

  async deletePricing(programId: string, pricingId: string, companyId: string): Promise<void> {
    // Using updateMany for soft delete with ownership check
    await prisma.productPricing.updateMany({
      where: {
        id: pricingId,
        productId: programId,
        product: {
          companyId: companyId,
        },
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    })
  }
}
