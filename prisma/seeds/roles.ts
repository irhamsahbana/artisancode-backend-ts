import { PrismaClient } from '@prisma/client'

export async function seedMasterRoles(prisma: PrismaClient) {
  console.log('Creating Master Roles...')

  const rolesToCreate = [
    { name: 'Owner', description: 'Owner of the company' },
    { name: 'Super Admin', description: 'Super Administrator to specific company' },
    { name: 'Admin', description: 'Administrator to specific branch in a company' },
  ]

  const createdRoles = []

  for (const role of rolesToCreate) {
    const created = await prisma.role.create({
      data: {
        name: role.name,
        description: role.description,
        companyId: null,
      }
    })
    createdRoles.push(created)
  }

  console.log('Master Roles created')
  return createdRoles
}

export async function seedCompanyRoles(prisma: PrismaClient, companyId: string) {
  console.log(`Copying Roles to Company ${companyId}...`)

  // Get master roles
  const masterRoles = await prisma.role.findMany({
    where: { companyId: null }
  })

  const companyRoles = []

  for (const masterRole of masterRoles) {
    const created = await prisma.role.create({
      data: {
        name: masterRole.name,
        description: masterRole.description,
        companyId: companyId,
      }
    })
    companyRoles.push(created)
  }

  console.log('Company Roles created. Assigning permissions...')

  // Fetch all permissions
  const allPermissions = await prisma.permission.findMany()

  // Define Permission Sets
  const ownerPermissions = allPermissions.filter(p =>
    p.name.endsWith(':read') ||
    p.name.endsWith(':view') ||
    p.name.startsWith('report:') ||
    p.name === 'dashboard:view'
  )

  const superAdminPermissions = allPermissions.filter(p =>
    !p.name.startsWith('company:delete') // Super Admin can do almost everything except deleting company
  )

  const adminPermissions = allPermissions.filter(p =>
    p.name.startsWith('branch:') ||
    p.name.startsWith('user:') ||
    p.name.startsWith('student:') ||
    p.name.startsWith('teacher:') ||
    p.name.startsWith('enrollment:') ||
    p.name.startsWith('program:') ||
    p.name.startsWith('finance:') ||
    p.name.startsWith('report:') ||
    p.name === 'dashboard:view'
  )

  // Assign permissions
  for (const role of companyRoles) {
    let permissionsToAssign: typeof allPermissions = []

    if (role.name === 'Owner') {
        permissionsToAssign = ownerPermissions
    } else if (role.name === 'Super Admin') {
        permissionsToAssign = superAdminPermissions
    } else if (role.name === 'Admin') {
        permissionsToAssign = adminPermissions
    }

    if (permissionsToAssign.length > 0) {
        await prisma.rolePermission.createMany({
            data: permissionsToAssign.map(p => ({
                roleId: role.id,
                permissionId: p.id
            }))
        })
    }
  }

  console.log('Permissions assigned')

  const ownerRole = companyRoles.find(r => r.name === 'Owner')
  const superAdminRole = companyRoles.find(r => r.name === 'Super Admin')
  const adminRole = companyRoles.find(r => r.name === 'Admin')

  if (!ownerRole || !superAdminRole || !adminRole) {
      throw new Error('Failed to create necessary company roles')
  }

  return {
    ownerRole,
    superAdminRole,
    adminRole,
    all: companyRoles
  }
}
