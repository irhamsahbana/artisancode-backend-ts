import { Prisma, User } from '@prisma/client'

import prisma from '@/common/prisma'
import * as Entity from '@/entities/user.entity'

import { IUserRepo } from './user.contract'

export default class UserRepo implements IUserRepo {
  private toEntity(data: User): Entity.User {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = data
    return rest as unknown as Entity.User
  }

  async create(req: Entity.CreateUserReq): Promise<Entity.User> {
    const data = await prisma.user.create({
      data: {
        name: req.name,
        username: req.username,
        email: req.email,
        password: req.password,
        phone: req.phone,
        companyId: req.company_id,
        roleId: req.role_id,
        status: req.status || 'active',
      },
    })
    return this.toEntity(data)
  }

  async findList(req: Entity.GetUserReq): Promise<Entity.UserList> {
    const { pagination = {}, ...rest } = req
    const { page = 1, per_page = 10 } = pagination
    const skip = (page - 1) * per_page
    const take = per_page

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(rest.id && { id: rest.id }),
      ...(rest.username && { username: rest.username }),
      ...(rest.company_id && { companyId: rest.company_id }),
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
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

  async findById(id: string, companyId?: string): Promise<Entity.User | null> {
    const where: Prisma.UserWhereInput = { id, deletedAt: null }
    if (companyId) {
      where.companyId = companyId
    }
    const data = await prisma.user.findFirst({
      where,
    })
    if (!data) return null
    return this.toEntity(data)
  }

  async findByUsername(username: string): Promise<Entity.User | null> {
    const data = await prisma.user.findFirst({
      where: { username, deletedAt: null },
    })
    if (!data) return null
    return this.toEntity(data)
  }

  async findByUsernameForLogin(
    username: string,
  ): Promise<(Entity.User & { password: string }) | null> {
    const data = await prisma.user.findFirst({
      where: { username, deletedAt: null },
    })
    if (!data) return null
    return data as Entity.User & { password: string }
  }
}
