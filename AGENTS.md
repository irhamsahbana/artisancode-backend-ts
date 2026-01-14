# User Preferences

- Be objective and truthful, even if it may be difficult to hear.
- When editing files, always use absolute paths.
- Ask for permission before modifying or creating any files.
- When making changes to a file, explain why the change is being made.
- When generating code, add comments in English.

# Technical Guidelines

## Tech Stack
- **Runtime**: Node.js 24.x
- **Package Manager**: pnpm
- **Language**: TypeScript
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL 18.x
- **ORM**: Prisma 7.x
- **Validation**: Joi
- **Logging**: Winston

## Architecture
The project follows a **Modular Clean Architecture**.
Path: `src/modules/[module_name]/`

### Module Components
1.  **Contract** (`*.contract.ts`): Defines interfaces for Usecase and Repository.
2.  **Entity** (`src/entities/*.entity.ts`): Domain entities and DTOs.
3.  **Repository** (`*.repo.ts`): Data access layer using Prisma. Implements Repository Interface.
4.  **Usecase** (`*.usecase.ts`): Business logic layer. Implements Usecase Interface.
5.  **Handler** (`*.handler.ts`): HTTP controller layer. Handles Request/Response.
6.  **Schema** (`*.schema.ts`): Joi validation schemas.
7.  **Index** (`*.index.ts`): Wiring of dependencies and Router definition.

## Coding Conventions

### Naming
- **Modules**: `snake_case` (e.g., `role_and_permission`).
- **Files**:
    - Standard components: `[module].[component].ts` (e.g., `user.handler.ts`).
    - Utilities/Shared: `snake_case` (e.g., `rest_response.ts`).
- **Classes**: `PascalCase` (e.g., `UserHandler`).
- **Interfaces**: `I` prefix (e.g., `IUserRepo`).
- **Variables/Functions**: `camelCase`.
- **Database Tables**: `snake_case` (plural).
- **Database Columns**: `snake_case` (mapped to `camelCase` in Prisma).

### Database & Prisma
- **IDs**: Use UUIDv7.
- **Soft Deletes**: All tables must have `deletedAt`. Queries must filter `deletedAt: null`.
- **Multi-tenancy**:
    - Most tables (except global ones like `Company`) must have a `companyId` column.
    - **Queries must always filter by `companyId`** to ensure tenant isolation.
    - Example: `where: { companyId: user.companyId, deletedAt: null }`.
- **Mapping**: Use `@map` in Prisma schema to map camelCase fields to snake_case DB columns.

### API Response
- Use standard helpers from `@/common/rest_response`:
    - `responseSuccess(data, message)`
    - `responseError(message, errors)`
- **Snake Case**: The `responseSuccess` helper automatically converts data keys to `snake_case`.

### Validation
- Use **Joi** schemas defined in `*.schema.ts`.
- Apply validation middleware in `*.index.ts`:
    - `validate(Schema)` for `req.body`.
    - `validateQuery(Schema)` for `req.query`.

### Authentication
- Use `authenticate` middleware from `@/common/middlewares/auth.middleware`.
- Access user data via `(req as AuthenticatedRequest).user`.

## Development Workflow
1.  **Define Schema**: Create/Update Prisma model in `prisma/models/`.
2.  **Define Entity**: Create types in `src/entities/`.
3.  **Create Module**:
    - Define `Contract` interfaces.
    - Implement `Repository`.
    - Implement `Usecase`.
    - Define `Joi Schemas`.
    - Implement `Handler`.
    - Wire up in `Index`.
4.  **Register Route**: Add module router to `src/routes/rest.ts`.
