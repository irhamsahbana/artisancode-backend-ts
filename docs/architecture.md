# Architecture

The project follows a **Modular Clean Architecture**.
Path: `src/modules/[module_name]/`

## Module Components

1.  **Contract** (`*.contract.ts`): Defines interfaces for Usecase and Repository.
2.  **Entity** (`src/entities/*.entity.ts`): Domain entities and DTOs.
3.  **Repository** (`*.repo.ts`): Data access layer using Prisma. Implements Repository Interface.
4.  **Usecase** (`*.usecase.ts`): Business logic layer. Implements Usecase Interface.
5.  **Handler** (`*.handler.ts`): HTTP controller layer. Handles Request/Response.
6.  **Schema** (`*.schema.ts`): Joi validation schemas.
7.  **Index** (`*.index.ts`): Wiring of dependencies and Router definition.
