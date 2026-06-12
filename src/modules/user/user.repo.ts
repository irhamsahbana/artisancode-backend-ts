import { eq, and, or, isNull, sql } from 'drizzle-orm'

import { db } from '@/common/db'
import { companies, permissions, rolePermissions, roles, users } from '@/db/schema'
import * as Entity from '@/entities/user.entity'

import { IUserRepo } from './user.contract'

export default class UserRepo implements IUserRepo {
  private toEntity(data: typeof users.$inferSelect): Entity.User {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = data
    return rest as unknown as Entity.User
  }

  async create(req: Entity.CreateUserReq): Promise<Entity.User> {
    const [row] = await db
      .insert(users)
      .values({
        name: req.name,
        username: req.username,
        email: req.email,
        password: req.password,
        phone: req.phone,
        companyId: req.company_id,
        roleId: req.role_id,
        status: req.status || 'active',
      })
      .returning()
    return this.toEntity(row)
  }

  async checkExistingUser(username: string, email: string): Promise<boolean> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(or(eq(users.username, username), eq(users.email, email)))
    return result.count > 0
  }

  async register(req: Entity.RegisterReq): Promise<Entity.RegisterRes> {
    return await db.transaction(async (tx) => {
      // 1. Create Company
      const [company] = await tx
        .insert(companies)
        .values({ name: req.company_name, status: 'active' })
        .returning()

      // 2. Create Roles
      const [ownerRole] = await tx
        .insert(roles)
        .values({ companyId: company.id, name: 'Owner', description: 'Company Owner' })
        .returning()

      const [superadminRole] = await tx
        .insert(roles)
        .values({ companyId: company.id, name: 'Superadmin', description: 'Company Superadmin' })
        .returning()

      // 3. Assign Permissions
      const allPermissions = await tx.select().from(permissions)
      const permissionIds = allPermissions.map((p) => p.id)

      if (permissionIds.length > 0) {
        await tx
          .insert(rolePermissions)
          .values(permissionIds.map((pid) => ({ roleId: ownerRole.id, permissionId: pid })))

        await tx
          .insert(rolePermissions)
          .values(permissionIds.map((pid) => ({ roleId: superadminRole.id, permissionId: pid })))
      }

      // 4. Create User
      const [user] = await tx
        .insert(users)
        .values({
          companyId: company.id,
          roleId: ownerRole.id,
          name: req.name,
          username: req.username,
          email: req.email,
          password: req.password,
          phone: req.phone,
          status: 'active',
        })
        .returning()

      return {
        company: { id: company.id, name: company.name },
        user: { id: user.id, username: user.username, email: user.email },
      }
    })
  }

  async findList(req: Entity.GetUserReq): Promise<Entity.UserList> {
    const { pagination = {}, ...rest } = req
    const { page = 1, per_page = 10 } = pagination
    const offset = (page - 1) * per_page

    const conditions = [isNull(users.deletedAt)]

    if (rest.id) {
      conditions.push(eq(users.id, rest.id))
    }
    if (rest.username) {
      conditions.push(eq(users.username, rest.username))
    }
    if (rest.company_id) {
      conditions.push(eq(users.companyId, rest.company_id))
    }

    const where = and(...conditions)

    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(users)
        .where(where)
        .orderBy(sql`${users.createdAt} desc`)
        .limit(per_page)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(where),
    ])

    const total = countResult[0]?.count ?? 0

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
    const conditions = [eq(users.id, id), isNull(users.deletedAt)]
    if (companyId) {
      conditions.push(eq(users.companyId, companyId))
    }

    const [row] = await db
      .select()
      .from(users)
      .where(and(...conditions))
      .limit(1)
    return row ? this.toEntity(row) : null
  }

  async findByUsername(username: string): Promise<Entity.User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(and(eq(users.username, username), isNull(users.deletedAt)))
      .limit(1)
    return row ? this.toEntity(row) : null
  }

  async findByUsernameForLogin(
    username: string,
  ): Promise<(Entity.User & { password: string }) | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(and(eq(users.username, username), isNull(users.deletedAt)))
      .limit(1)
    return (row as Entity.User & { password: string }) ?? null
  }
}
