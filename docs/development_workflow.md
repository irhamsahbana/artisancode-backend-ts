# Development Workflow

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
5.  **Verification**: Run `pnpm lint:fix` and `pnpm type-check`.
