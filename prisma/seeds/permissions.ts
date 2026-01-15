import { PrismaClient } from '@prisma/client'

export const PERMISSIONS = [
  // Dashboard
  { name: 'dashboard:view', description: 'View dashboard analytics' },

  // Company (Usually Super Admin only)
  { name: 'company:read', description: 'View company details' },
  { name: 'company:update', description: 'Update company details' },

  // Branch
  { name: 'branch:create', description: 'Create new branches' },
  { name: 'branch:read', description: 'View branches' },
  { name: 'branch:update', description: 'Update branch details' },
  { name: 'branch:delete', description: 'Delete branches' },

  // User Management
  { name: 'user:create', description: 'Create new users' },
  { name: 'user:read', description: 'View users' },
  { name: 'user:update', description: 'Update user details' },
  { name: 'user:delete', description: 'Delete users' },
  { name: 'user:reset_password', description: 'Reset user passwords' },

  // Role & Permissions
  { name: 'role:create', description: 'Create new roles' },
  { name: 'role:read', description: 'View roles' },
  { name: 'role:update', description: 'Update roles' },
  { name: 'role:delete', description: 'Delete roles' },
  { name: 'role:assign', description: 'Assign roles to users' },

  // Student
  { name: 'student:create', description: 'Register new students' },
  { name: 'student:read', description: 'View student profiles' },
  { name: 'student:update', description: 'Update student profiles' },
  { name: 'student:delete', description: 'Delete students' },
  { name: 'student:import', description: 'Bulk import students' },

  // Teacher
  { name: 'teacher:create', description: 'Register new teachers' },
  { name: 'teacher:read', description: 'View teacher profiles' },
  { name: 'teacher:update', description: 'Update teacher profiles' },
  { name: 'teacher:delete', description: 'Delete teachers' },
  { name: 'teacher:assign_program', description: 'Assign teachers to programs' },

  // Category (for Programs/Students)
  { name: 'category:create', description: 'Create categories' },
  { name: 'category:read', description: 'View categories' },
  { name: 'category:update', description: 'Update categories' },
  { name: 'category:delete', description: 'Delete categories' },

  // Program (Product)
  { name: 'program:create', description: 'Create new programs' },
  { name: 'program:read', description: 'View programs' },
  { name: 'program:update', description: 'Update programs' },
  { name: 'program:delete', description: 'Delete programs' },
  { name: 'program:manage_pricing', description: 'Manage program pricing' },
  { name: 'program:manage_schedule', description: 'Manage program schedules' },

  // Enrollment
  { name: 'enrollment:create', description: 'Enroll students' },
  { name: 'enrollment:read', description: 'View enrollments' },
  { name: 'enrollment:update', description: 'Update enrollment status' },
  { name: 'enrollment:delete', description: 'Cancel/Delete enrollments' },

  // Finance
  { name: 'finance:invoice:create', description: 'Create invoices' },
  { name: 'finance:invoice:read', description: 'View invoices' },
  { name: 'finance:invoice:update', description: 'Update invoices' },
  { name: 'finance:invoice:void', description: 'Void invoices' },
  { name: 'finance:payment:record', description: 'Record payments' },
  { name: 'finance:payment:read', description: 'View payment history' },

  // Reports
  { name: 'report:finance', description: 'View finance reports' },
  { name: 'report:academic', description: 'View academic reports' },
]

export async function seedPermissions(prisma: PrismaClient) {
  console.log('Seeding Permissions...')

  const createdPermissions = []

  for (const perm of PERMISSIONS) {
    const p = await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: {
        name: perm.name,
        description: perm.description,
      }
    })
    createdPermissions.push(p)
  }

  console.log(`Seeded ${createdPermissions.length} permissions`)
  return createdPermissions
}
