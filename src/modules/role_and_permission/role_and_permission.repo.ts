import { Prisma, Role, Permission } from '@prisma/client'

import prisma from '@/common/prisma'
import * as Entity from '@/entities/role.entity'

import { IRoleAndPermissionRepo } from './role_and_permission.contract'

export default class RoleAndPermissionRepo implements IRoleAndPermissionRepo {
  private toRoleEntity(data: Role & { permissions?: { permission: Permission }[] }): Entity.Role {
    const permissions = data.permissions?.map((p) => ({
      id: p.permission.id,
      name: p.permission.name,
      description: p.permission.description,
      createdAt: p.permission.createdAt,
      updatedAt: p.permission.updatedAt,
      deletedAt: p.permission.deletedAt,
    }))
    return {
      id: data.id,
      companyId: data.companyId,
      name: data.name,
      description: data.description,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      deletedAt: data.deletedAt,
      permissions,
    }
  }

  private toPermissionEntity(data: Permission): Entity.Permission {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      deletedAt: data.deletedAt,
    }
  }

  // Role Methods
  async createRole(req: Entity.CreateRoleReq): Promise<Entity.Role> {
    if (!req.company_id) {
      throw new Error('Company ID is required to create a role')
    }
    const data = await prisma.role.create({
      data: {
        name: req.name,
        description: req.description || '',
        companyId: req.company_id,
        permissions: {
          create: req.permission_ids?.map((id) => ({
            permission: { connect: { id } },
          })),
        },
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    })
    return this.toRoleEntity(data)
  }

  async findRoleList(req: Entity.GetRoleReq): Promise<Entity.RoleList> {
    const { pagination = {}, q } = req
    const { page = 1, per_page = 10 } = pagination
    const skip = (page - 1) * per_page
    const take = per_page

    const where: Prisma.RoleWhereInput = {
      ...(req.company_id && { companyId: req.company_id }),
      deletedAt: null,
    }

    if (q) {
      where.name = {
        contains: q,
        mode: 'insensitive',
      }
    }

    if (req.ids) {
      where.id = {
        in: req.ids,
      }
    }

    const [items, total] = await Promise.all([
      prisma.role.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      }),
      prisma.role.count({ where }),
    ])

    return {
      items: items.map((item) => this.toRoleEntity(item)),
      pagination: {
        total,
        page,
        per_page,
        last_page: Math.ceil(total / per_page),
      },
    }
  }

  async findRoleById(id: string, companyId?: string): Promise<Entity.Role | null> {
    const where: Prisma.RoleWhereInput = { id, deletedAt: null }
    if (companyId) {
      where.companyId = companyId
    }
    const data = await prisma.role.findFirst({
      where,
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    })
    if (!data) return null
    return this.toRoleEntity(data)
  }

  async updateRole(req: Entity.UpdateRoleReq): Promise<Entity.Role> {
    const { id, permission_ids, company_id, ...rest } = req
    // If permission_ids is provided, we need to handle the update of relations
    // This is a "replace" strategy: delete existing and create new
    if (permission_ids) {
      // First, delete existing relations
      await prisma.rolePermission.deleteMany({
        where: { roleId: id },
      })
    }

    const where: Prisma.RoleWhereUniqueInput = { id }
    if (company_id) {
      where.companyId = company_id
    }

    const data = await prisma.role.update({
      where,
      data: {
        ...rest,
        permissions: permission_ids
          ? {
              create: permission_ids.map((pId) => ({
                permission: { connect: { id: pId } },
              })),
            }
          : undefined,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    })
    return this.toRoleEntity(data)
  }

  async deleteRole(id: string, companyId?: string): Promise<void> {
    // Note: If companyId is provided, the usecase should have already verified ownership via findRoleById
    // But for double safety in delete operation if needed, we could use deleteMany or verify again.
    // Since usecase checks existence with companyId, simple delete by ID is safe enough for now as ID is unique.
    // However, if we want strict atomic check:
    if (companyId) {
      const count = await prisma.role.count({ where: { id, companyId, deletedAt: null } })
      if (count === 0) return // Or throw, but usecase handles "Not Found"
    }

    await prisma.role.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    })
  }

  // Permission Methods
  async findPermissionList(req: Entity.GetPermissionReq): Promise<Entity.PermissionList> {
    const { pagination = {}, q } = req
    const { page = 1, per_page = 10 } = pagination
    const skip = (page - 1) * per_page
    const take = per_page

    const where: Prisma.PermissionWhereInput = {
      deletedAt: null,
    }

    if (q) {
      where.name = {
        contains: q,
        mode: 'insensitive',
      }
    }

    const [items, total] = await Promise.all([
      prisma.permission.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      prisma.permission.count({ where }),
    ])

    return {
      items: items.map((item) => this.toPermissionEntity(item)),
      pagination: {
        total,
        page,
        per_page,
        last_page: Math.ceil(total / per_page),
      },
    }
  }
}
