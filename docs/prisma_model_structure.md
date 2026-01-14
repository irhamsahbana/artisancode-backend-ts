# Prisma Model Structure Guidelines

This document outlines the standard conventions for defining Prisma models in this project. All models must adhere to these rules to ensure consistency, multi-tenancy support, and proper database mapping.

## File Location
- All Prisma model definitions must be placed in individual files within `prisma/models/`.
- The file name should correspond to the model name in `snake_case` (e.g., `user.prisma`, `pricing_plan.prisma`).

## General Conventions

### Naming
- **Model Names**: Use `PascalCase` (e.g., `User`, `PricingPlan`).
- **Field Names**: Use `camelCase` (e.g., `firstName`, `createdAt`).
- **Table Names**: Explicitly map to `snake_case` plural names using `@@map("table_name_plural")`.
- **Column Names**: Explicitly map fields to `snake_case` columns using `@map("column_name")`.

### IDs
- All models must use **UUIDv7** for primary keys.
- **Definition**:
  ```prisma
  id String @id @default(uuid(7))
  ```

### Soft Deletes
- Every model representing a persistent entity must include a `deletedAt` field for soft deletion.
- **Definition**:
  ```prisma
  deletedAt DateTime? @map("deleted_at")
  ```
- **Querying**: Always filter by `deletedAt: null` in your repository logic.

### Timestamps
- Include `createdAt` and `updatedAt` (where applicable).
- **Definition**:
  ```prisma
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  ```

## Multi-Tenancy

- **Company Association**: Most entities (except global ones like `Company` itself) belong to a tenant.
- **Field Requirement**: Must have a `companyId` field.
- **Relation**: Link it to the `Company` model.
- **Definition**:
  ```prisma
  companyId String @map("company_id")
  company   Company @relation(fields: [companyId], references: [id])
  ```
- **Indexing**: Always include a compound index on `[companyId, deletedAt]` for efficient tenant-scoped filtering.
  ```prisma
  @@index([companyId, deletedAt])
  ```

## Example Model

Here is a complete example of a compliant model:

```prisma
model User {
  // Primary Key
  id String @id @default(uuid(7))

  // Tenant Foreign Key
  companyId String @map("company_id")

  // Data Fields (camelCase field -> snake_case column)
  email     String @unique
  firstName String @map("first_name")
  lastName  String @map("last_name")

  // Timestamps & Soft Delete
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  // Relations
  company Company @relation(fields: [companyId], references: [id])

  // Table Mapping
  @@map("users")

  // Indexes
  @@index([companyId, deletedAt])
}
```

## Enums
- Enums should be defined in `prisma/models/enum.prisma` or alongside the relevant model if highly specific.
- Use `PascalCase` for Enum names and `snake_case` for Enum values if they represent database values, or keep them consistent with the domain.
