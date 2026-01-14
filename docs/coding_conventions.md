# Coding Conventions

## Naming
- **Modules**: `snake_case` (e.g., `role_and_permission`).
- **Files**:
    - Standard components: `[module].[component].ts` (e.g., `user.handler.ts`).
    - Utilities/Shared: `snake_case` (e.g., `rest_response.ts`).
- **Classes**: `PascalCase` (e.g., `UserHandler`).
- **Interfaces**: `I` prefix (e.g., `IUserRepo`).
- **Variables/Functions**: `camelCase`.
- **Database Tables**: `snake_case` (plural).
- **Database Columns**: `snake_case` (mapped to `camelCase` in Prisma).

## Database & Prisma
- **IDs**: Use UUIDv7.
- **Soft Deletes**: All tables must have `deletedAt`. Queries must filter `deletedAt: null`.
- **Multi-tenancy**:
    - Most tables (except global ones like `Company`) must have a `companyId` column.
    - **Queries must always filter by `companyId`** to ensure tenant isolation.
    - Example: `where: { companyId: user.companyId, deletedAt: null }`.
- **Mapping**: Use `@map` in Prisma schema to map camelCase fields to snake_case DB columns.

## API Response
- Use standard helpers from `@/common/rest_response`:
    - `responseSuccess(data, message)`
    - `responseError(message, errors)`
- **Snake Case**: The `responseSuccess` helper automatically converts data keys to `snake_case`.

## Validation
- Use **Joi** schemas defined in `*.schema.ts`.
- Apply validation middleware in `*.index.ts`:
    - `validate(Schema)` for `req.body`.
    - `validateQuery(Schema)` for `req.query`.

## Authentication
- Use `authenticate` middleware from `@/common/middlewares/auth.middleware`.
- Access user data via `(req as AuthenticatedRequest).user`.
