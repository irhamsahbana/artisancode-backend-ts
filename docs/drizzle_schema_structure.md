# Drizzle Schema Structure Guidelines

This document outlines the standard conventions for defining Drizzle schemas in this project. All tables must adhere to these rules to ensure consistency, multi-tenancy support, and proper database mapping.

## File Location
- All table definitions are placed in individual files within `src/db/schema/tables/`.
- Enums are defined in `src/db/schema/enums.ts`.
- Relations are defined in `src/db/schema/relations.ts`.
- Shared helpers (timestamps, softDelete) are in `src/db/schema/tables/helpers.ts`.

## General Conventions

### Naming
- **Table Names**: Use `camelCase` for variable names (e.g., `users`, `productPricings`).
- **Column Names**: Use `camelCase` in code, mapped to `snake_case` in DB via string parameter (e.g., `firstName: text('first_name')`).

### IDs
- All tables use **UUID** for primary keys via the shared `defaultId` helper.
- **Definition**:
  ```typescript
  import { defaultId } from './helpers'
  // defaultId = uuid('id').primaryKey().defaultRandom()
  ```

### Soft Deletes
- Every table representing a persistent entity includes `deletedAt` via the shared `softDelete` helper.
- **Definition**:
  ```typescript
  import { softDelete } from './helpers'
  // softDelete = { deletedAt: timestamp('deleted_at', { withTimezone: true }) }
  ```
- **Querying**: Always filter with `isNull(table.deletedAt)`.

### Timestamps
- Include `createdAt` and `updatedAt` via the shared `timestamps` helper.
- **Definition**:
  ```typescript
  import { timestamps } from './helpers'
  // timestamps = {
  //   createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  //   updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  // }
  ```

## Multi-Tenancy

- **Company Association**: Most entities (except global ones like `companies` itself) belong to a tenant.
- **Field Requirement**: Must have a `companyId` field.
- **Definition**:
  ```typescript
  companyId: uuid('company_id').notNull().references(() => companies.id),
  ```
- **Indexing**: Always include a compound index on `[companyId, deletedAt]` for efficient tenant-scoped filtering.
  ```typescript
  (t) => [index('table_company_id_deleted_at_idx').on(t.companyId, t.deletedAt)]
  ```

## Example Table

Here is a complete example of a compliant table:

```typescript
import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { statusEnum } from '../enums'
import { companies } from './company'
import { defaultId, softDelete, timestamps } from './helpers'

export const users = pgTable(
  'users',
  {
    // Primary Key
    id: defaultId,

    // Tenant Foreign Key
    companyId: uuid('company_id').notNull().references(() => companies.id),

    // Data Fields (camelCase -> snake_case)
    email: text('email').notNull().unique(),
    firstName: text('first_name').notNull().default(''),
    lastName: text('last_name').notNull().default(''),

    // Status
    status: statusEnum('status').notNull().default('active'),

    // Timestamps & Soft Delete
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    index('users_company_id_deleted_at_idx').on(t.companyId, t.deletedAt),
  ],
)
```

## Enums
- Enums are defined in `src/db/schema/enums.ts` using `pgEnum()`.
- Use `camelCase` for variable names and `snake_case` for DB values.
  ```typescript
  import { pgEnum } from 'drizzle-orm/pg-core'

  export const statusEnum = pgEnum('status', ['active', 'inactive'])
  ```

## Relations
- Relations are defined in `src/db/schema/relations.ts` using `relations()`.
- One-to-many, many-to-one, and many-to-many patterns are supported.
  ```typescript
  import { relations } from 'drizzle-orm'
  import { users } from './tables'

  export const usersRelations = relations(users, ({ one, many }) => ({
    company: one(companies, { fields: [users.companyId], references: [companies.id] }),
  }))
  ```

## Migration Workflow

Use `drizzle-kit generate` + `drizzle-kit migrate` (NOT `push`) to track schema changes.

### Commands

```bash
# Generate migration file from schema changes
bun run drizzle:generate

# Apply pending migrations to database
bun run drizzle:migrate

# Push schema directly (dev only, no migration file created)
bun run drizzle:push
```

### When to use what

| Command | Use Case | Creates Migration File | Safe for Production |
|---|---|---|---|
| `drizzle:generate` + `drizzle:migrate` | Production, CI/CD, version control | Yes | ✅ Yes |
| `drizzle:push` | Quick prototyping, local dev | No | ❌ **No** |

### ⚠️ Warning: Why `drizzle:push` is Dangerous in Production

`drizzle:push` **should NEVER be used in production or on databases with important data**.

**Risks:**

1. **No migration history** - Changes are not tracked, making audits impossible
2. **No rollback capability** - Cannot undo changes if something goes wrong
3. **Data loss risk** - Removing columns or tables deletes data permanently
4. **Team collaboration issues** - Other developers won't know about schema changes
5. **CI/CD problems** - Cannot be integrated into automated deployment workflows

**Safe usage:**

- ✅ Local development (when iterating quickly)
- ✅ Test databases (setup/teardown)
- ✅ Prototyping (exploring schema designs)

**Never use for:**

- ❌ Production databases
- ❌ Staging environments
- ❌ Any database with important data

**Best practice:**

```bash
# Always backup before production changes
pg_dump your_database > backup_$(date +%Y%m%d).sql

# Then use proper migration workflow
bun run drizzle:generate
bun run drizzle:migrate
```

### Workflow

1. Make changes to schema files (`src/db/schema/tables/*.ts`, `enums.ts`, `relations.ts`)
2. Run `bun run drizzle:generate` to generate SQL migration
3. Review the generated SQL in `drizzle/migrations/`
4. Run `bun run drizzle:migrate` to apply to database

### Generated files

```text
drizzle/
  migrations/
    0000_migration_name.sql    ← SQL migration file
    meta/
      _journal.json            ← Migration journal (order + checksums)
      0000_snapshot.json       ← Schema snapshot
```
