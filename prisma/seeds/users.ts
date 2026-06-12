import { db } from '../../src/common/db'
import { hashPassword } from '../../src/common/encryption'
import { users } from '../../src/db/schema'

export async function seedUsers(
  companyId: string,
  roles: { ownerRoleId: string; superAdminRoleId: string; adminRoleId: string },
) {
  console.log('Creating Users...')
  const password = await hashPassword('password123')

  await db.insert(users).values([
    {
      name: 'Owner User',
      username: 'owner',
      email: 'owner@tola.solutions',
      password,
      roleId: roles.ownerRoleId,
      companyId,
      status: 'active',
      phone: '081234567890',
    },
    {
      name: 'Super Admin User',
      username: 'superadmin',
      email: 'superadmin@tola.solutions',
      password,
      roleId: roles.superAdminRoleId,
      companyId,
      status: 'active',
      phone: '081234567891',
    },
    {
      name: 'Branch Admin User',
      username: 'admin',
      email: 'admin@tola.solutions',
      password,
      roleId: roles.adminRoleId,
      companyId,
      status: 'active',
      phone: '081234567892',
    },
  ])

  console.log('Users created')
}
