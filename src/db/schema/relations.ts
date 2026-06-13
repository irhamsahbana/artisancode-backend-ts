import { relations } from 'drizzle-orm'

import {
  activityLogs,
  branches,
  categories,
  companies,
  enrollments,
  invoices,
  payments,
  permissions,
  productPricings,
  productPrices,
  productSchedules,
  products,
  rolePermissions,
  roles,
  storageFiles,
  students,
  teacherProducts,
  teachers,
  users,
} from './tables'

// ---------------------------------------------------------------------------
// Company (root — no FK references, kept for clarity)
// ---------------------------------------------------------------------------
export const companiesRelations = relations(companies, ({ many }) => ({
  branches: many(branches),
  categories: many(categories),
  users: many(users),
  roles: many(roles),
  products: many(products),
  teachers: many(teachers),
  students: many(students),
  enrollments: many(enrollments),
  invoices: many(invoices),
  payments: many(payments),
  activityLogs: many(activityLogs),
}))

// ---------------------------------------------------------------------------
// Branch (FK to company removed — no cross-module one() relation)
// ---------------------------------------------------------------------------
export const branchesRelations = relations(branches, ({ many }) => ({
  users: many(users),
  products: many(products),
  teachers: many(teachers),
  students: many(students),
  enrollments: many(enrollments),
  invoices: many(invoices),
  payments: many(payments),
  activityLogs: many(activityLogs),
}))

// ---------------------------------------------------------------------------
// Role (FK to company removed)
// ---------------------------------------------------------------------------
export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
  rolePermissions: many(rolePermissions),
}))

// ---------------------------------------------------------------------------
// Permission
// ---------------------------------------------------------------------------
export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}))

// ---------------------------------------------------------------------------
// RolePermission (intra-module — kept)
// ---------------------------------------------------------------------------
export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, { fields: [rolePermissions.roleId], references: [roles.id] }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}))

// ---------------------------------------------------------------------------
// User (FKs to company, branch, role removed)
// ---------------------------------------------------------------------------
export const usersRelations = relations(users, ({ many }) => ({
  activityLogs: many(activityLogs),
}))

// ---------------------------------------------------------------------------
// Student (FKs to company, branch removed)
// ---------------------------------------------------------------------------
export const studentsRelations = relations(students, ({ many }) => ({
  enrollments: many(enrollments),
}))

// ---------------------------------------------------------------------------
// Teacher (FKs to company, branch removed)
// ---------------------------------------------------------------------------
export const teachersRelations = relations(teachers, ({ many }) => ({
  teacherProducts: many(teacherProducts),
}))

// ---------------------------------------------------------------------------
// TeacherProduct (teacher FK removed — only product remains intra-module)
// ---------------------------------------------------------------------------
export const teacherProductsRelations = relations(teacherProducts, ({ one }) => ({
  product: one(products, { fields: [teacherProducts.productId], references: [products.id] }),
}))

// ---------------------------------------------------------------------------
// Product (FKs to company, branch removed)
// ---------------------------------------------------------------------------
export const productsRelations = relations(products, ({ many }) => ({
  pricings: many(productPricings),
  enrollments: many(enrollments),
  productSchedules: many(productSchedules),
  teacherProducts: many(teacherProducts),
}))

// ---------------------------------------------------------------------------
// ProductPricing (intra-module — kept)
// ---------------------------------------------------------------------------
export const productPricingsRelations = relations(productPricings, ({ one, many }) => ({
  product: one(products, { fields: [productPricings.productId], references: [products.id] }),
  enrollments: many(enrollments),
  prices: many(productPrices),
}))

// ---------------------------------------------------------------------------
// ProductPrice (intra-module — kept)
// ---------------------------------------------------------------------------
export const productPricesRelations = relations(productPrices, ({ one }) => ({
  productPricing: one(productPricings, {
    fields: [productPrices.productPricingId],
    references: [productPricings.id],
  }),
}))

// ---------------------------------------------------------------------------
// ProductSchedule (intra-module — kept)
// ---------------------------------------------------------------------------
export const productSchedulesRelations = relations(productSchedules, ({ one }) => ({
  product: one(products, { fields: [productSchedules.productId], references: [products.id] }),
}))

// ---------------------------------------------------------------------------
// Category (FK to company removed — self-referential kept)
// ---------------------------------------------------------------------------
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'categoryHierarchy',
  }),
  children: many(categories, { relationName: 'categoryHierarchy' }),
}))

// ---------------------------------------------------------------------------
// Enrollment (FKs to company, branch, student, product, productPricing removed)
// ---------------------------------------------------------------------------
export const enrollmentsRelations = relations(enrollments, ({ many }) => ({
  invoices: many(invoices),
}))

// ---------------------------------------------------------------------------
// Invoice (FKs to company, branch removed — enrollment kept as intra-module)
// ---------------------------------------------------------------------------
export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  enrollment: one(enrollments, { fields: [invoices.enrollmentId], references: [enrollments.id] }),
  payments: many(payments),
}))

// ---------------------------------------------------------------------------
// Payment (FKs to company, branch removed — invoice kept as intra-module)
// ---------------------------------------------------------------------------
export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, { fields: [payments.invoiceId], references: [invoices.id] }),
}))

// ---------------------------------------------------------------------------
// ActivityLog (FKs to company, branch, user removed)
// ---------------------------------------------------------------------------
export const activityLogsRelations = relations(activityLogs, () => ({}))

// ---------------------------------------------------------------------------
// StorageFile (FKs to company, user removed)
// ---------------------------------------------------------------------------
export const storageFilesRelations = relations(storageFiles, () => ({}))
