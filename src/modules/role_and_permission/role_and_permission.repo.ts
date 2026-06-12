import { eq, and, ilike, inArray, isNull, sql } from 'drizzle-orm'

import { db } from '@/common/db'
import { permissions, rolePermissions, roles } from '@/db/schema'
import * as Entity from '@/entities/role.entity'

import { IRoleAndPermissionRepo } from './role_and_permission.contract'

export default class RoleAndPermissionRepo implements IRoleAndPermissionRepo {
  private toRoleEntity(
    data: typeof roles.$inferSelect & {
      rolePermissions?: { permission: typeof permissions.$inferSelect }[]
    },
  ): Entity.Role {
    const permissionsList = data.rolePermissions?.map((rp) => ({
      id: rp.permission.id,
      name: rp.permission.name,
      description: rp.permission.description,
      createdAt: rp.permission.createdAt,
      updatedAt: rp.permission.updatedAt,
      deletedAt: rp.permission.deletedAt,
    }))
    return {
      id: data.id,
      companyId: data.companyId ?? undefined,
      name: data.name,
      description: data.description,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      deletedAt: data.deletedAt,
      permissions: permissionsList,
    }
  }

  private toPermissionEntity(data: typeof permissions.$inferSelect): Entity.Permission {
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

    // Create role
    const [role] = await db
      .insert(roles)
      .values({
        name: req.name,
        description: req.description || '',
        companyId: req.company_id,
      })
      .returning()

    // Create role-permission associations
    if (req.permission_ids && req.permission_ids.length > 0) {
      await db.insert(rolePermissions).values(
        req.permission_ids.map((permissionId) => ({
          roleId: role.id,
          permissionId,
        })),
      )
    }

    // Fetch with permissions
    return this.findRoleById(role.id, req.company_id) as Promise<Entity.Role>
  }

  async findRoleList(req: Entity.GetRoleReq): Promise<Entity.RoleList> {
    const { pagination = {}, q } = req
    const { page = 1, per_page = 10 } = pagination
    const offset = (page - 1) * per_page

    const conditions = [isNull(roles.deletedAt)]

    if (req.company_id) {
      conditions.push(eq(roles.companyId, req.company_id))
    }

    if (q) {
      conditions.push(ilike(roles.name, `%${q}%`))
    }

    if (req.ids && req.ids.length > 0) {
      conditions.push(inArray(roles.id, req.ids))
    }

    const where = and(...conditions)

    // Fetch roles
    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(roles)
        .where(where)
        .orderBy(sql`${roles.createdAt} desc`)
        .limit(per_page)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(roles)
        .where(where),
    ])

    // Fetch permissions for each role
    const roleIds = items.map((r) => r.id)
    const allRolePermissions =
      roleIds.length > 0
        ? await db
            .select()
            .from(rolePermissions)
            .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
            .where(inArray(rolePermissions.roleId, roleIds))
        : []

    const permissionsByRole = new Map<string, typeof allRolePermissions>()
    for (const rp of allRolePermissions) {
      const roleId = rp.role_permissions.roleId
      const existing = permissionsByRole.get(roleId)
      if (existing) {
        existing.push(rp)
      } else {
        permissionsByRole.set(roleId, [rp])
      }
    }

    const total = countResult[0]?.count ?? 0

    return {
      items: items.map((item) => {
        const rps = permissionsByRole.get(item.id) || []
        return this.toRoleEntity({
          ...item,
          rolePermissions: rps.map((rp) => ({ permission: rp.permissions })),
        })
      }),
      pagination: {
        total,
        page,
        per_page,
        last_page: Math.ceil(total / per_page),
      },
    }
  }

  async findRoleById(id: string, companyId?: string): Promise<Entity.Role | null> {
    const conditions = [eq(roles.id, id), isNull(roles.deletedAt)]

    if (companyId) {
      conditions.push(eq(roles.companyId, companyId))
    }

    const [role] = await db
      .select()
      .from(roles)
      .where(and(...conditions))
      .limit(1)
    if (!role) return null

    // Fetch permissions
    const rps = await db
      .select()
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, id))

    return this.toRoleEntity({
      ...role,
      rolePermissions: rps.map((rp) => ({ permission: rp.permissions })),
    })
  }

  async updateRole(req: Entity.UpdateRoleReq): Promise<Entity.Role> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, permission_ids, company_id, user, ...rest } = req

    // Replace permissions if provided
    if (permission_ids) {
      await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id))

      if (permission_ids.length > 0) {
        await db.insert(rolePermissions).values(
          permission_ids.map((permissionId) => ({
            roleId: id,
            permissionId,
          })),
        )
      }
    }

    // Update role
    const whereConditions = [eq(roles.id, id)]
    if (company_id) {
      whereConditions.push(eq(roles.companyId, company_id))
    }

    await db
      .update(roles)
      .set(rest)
      .where(and(...whereConditions))

    // Return updated role with permissions
    return this.findRoleById(id, company_id) as Promise<Entity.Role>
  }

  async deleteRole(id: string, companyId?: string): Promise<void> {
    if (companyId) {
      const [existing] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(roles)
        .where(and(eq(roles.id, id), eq(roles.companyId, companyId), isNull(roles.deletedAt)))
      if (existing.count === 0) return
    }

    await db.update(roles).set({ deletedAt: new Date() }).where(eq(roles.id, id))
  }

  // Permission Methods
  async findPermissionList(req: Entity.GetPermissionReq): Promise<Entity.PermissionList> {
    const { pagination = {}, q } = req
    const { page = 1, per_page = 10 } = pagination
    const offset = (page - 1) * per_page

    const conditions = [isNull(permissions.deletedAt)]

    if (q) {
      conditions.push(ilike(permissions.name, `%${q}%`))
    }

    const where = and(...conditions)

    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(permissions)
        .where(where)
        .orderBy(permissions.name)
        .limit(per_page)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(permissions)
        .where(where),
    ])

    const total = countResult[0]?.count ?? 0

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
