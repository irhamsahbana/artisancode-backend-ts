import { db } from '@/common/db'
import { companies, permissions, rolePermissions, roles, users } from '@/db/schema'
import * as Entity from '@/entities/user.entity'

export async function register(req: Entity.RegisterReq): Promise<Entity.RegisterRes> {
  return await db.transaction(async (tx) => {
    const [company] = await tx
      .insert(companies)
      .values({ name: req.company_name, status: 'active' })
      .returning()

    const [ownerRole] = await tx
      .insert(roles)
      .values({ companyId: company.id, name: 'Owner', description: 'Company Owner' })
      .returning()

    const [superadminRole] = await tx
      .insert(roles)
      .values({ companyId: company.id, name: 'Superadmin', description: 'Company Superadmin' })
      .returning()

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
