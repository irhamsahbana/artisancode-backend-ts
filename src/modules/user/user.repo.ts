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

  async checkExistingUser(username: string, email: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: {
        OR: [{ username }, { email }],
      },
    })
    return count > 0
  }

  async register(req: Entity.RegisterReq): Promise<Entity.RegisterRes> {
    return await prisma.$transaction(async (tx) => {
      // 1. Create Company
      const company = await tx.company.create({
        data: {
          name: req.company_name,
          status: 'active',
        },
      })

      // 2. Create Roles
      const ownerRole = await tx.role.create({
        data: {
          companyId: company.id,
          name: 'Owner',
          description: 'Company Owner',
        },
      })

      const superadminRole = await tx.role.create({
        data: {
          companyId: company.id,
          name: 'Superadmin',
          description: 'Company Superadmin',
        },
      })

      // 3. Assign Permissions
      const permissions = await tx.permission.findMany()
      const permissionIds = permissions.map((p) => p.id)

      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((pid) => ({
            roleId: ownerRole.id,
            permissionId: pid,
          })),
        })

        await tx.rolePermission.createMany({
          data: permissionIds.map((pid) => ({
            roleId: superadminRole.id,
            permissionId: pid,
          })),
        })
      }

      // 4. Create User
      const user = await tx.user.create({
        data: {
          companyId: company.id,
          roleId: ownerRole.id,
          name: req.name,
          username: req.username,
          email: req.email,
          password: req.password,
          phone: req.phone,
          status: 'active',
        },
      })

      return {
        company: {
          id: company.id,
          name: company.name,
        },
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      }
    })
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
