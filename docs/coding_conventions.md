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

## Error Handling
- **Use `AppError`**: For known business logic errors (e.g., resource not found, duplicate entry, validation failure), always throw an `AppError` with the appropriate HTTP status code (e.g., 404, 409, 400).
- **Avoid Generic Errors**: Do not throw generic `Error` objects for business rules, as they result in 500 Internal Server Error responses.
- **Try-Catch**: Avoid using `try-catch` blocks in controllers/handlers. Express 5 automatically catches async errors and passes them to the global error handler. Only use `try-catch` if you need to handle a specific error locally (e.g., fallback logic).
- **Import**: `import { AppError } from '@/common/app_error'`

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

## Enums & Constants
- **Centralized Definition**: Define Enums and their valid values in the Entity file (`src/entities/[entity].entity.ts`).
    - **Type Definition**: Export a TypeScript type (e.g., `export type UserStatus = 'active' | 'inactive'`).
    - **Value List**: Export a constant array of all valid values (e.g., `export const UserStatuses: UserStatus[] = ['active', 'inactive']`).
- **Usage**:
    - **Entities**: Use the defined Type in interface definitions.
    - **Schemas**: Use the exported constant array in Joi validation (e.g., `.valid(...UserStatuses)`).
    - **Database**: Ensure these values align with Prisma Enums in `schema.prisma`.

## Authentication
- Use `authenticate` middleware from `@/common/middlewares/auth.middleware`.
- Access user data via `(req as AuthenticatedRequest).user`.
