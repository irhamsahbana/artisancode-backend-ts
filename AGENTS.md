# User Preferences

- Be objective and truthful, even if it may be difficult to hear.
- When editing files, always use absolute paths.
- Ask for permission before modifying or creating any files.
- When making changes to a file, explain why the change is being made.
- When generating code, add comments in English.
- **Shell & Package Manager**:
    - Use `fish` (preferred) or `bash` for shell commands.
    - Use `pnpm` for package management (installing dependencies).
    - **Running the App**: Prefer `pnpm run dev:bun` or `pnpm run start:bun` (using Bun runtime).
- **Documentation Maintenance**:
    - The AI agent is authorized to update `AGENTS.md` and `docs/` files to keep them accurate.
    - **Protocol**:
        1.  **Inform**: When making documentation changes, explicitly mention them in the final response (e.g., "Updated `docs/tech_stack.md` to reflect the new library").
        2.  **Suggest**: If the AI detects that the codebase patterns (e.g., new folder structure, new library) deviate from the existing docs, it must **proactively suggest** updating the relevant documentation file.
- **Business Logic Verification (Usecase Layer)**:
    - **Think Before Coding**: When working on the `usecase` layer, proactively identify potential edge cases, business rules, and validation scenarios (e.g., uniqueness checks, state transitions).
    - **Confirm First**: Explicitly list these scenarios and ask the user for confirmation *before* implementing the logic.
- **Error Handling**:
    - **Use `AppError`**: For known business logic errors (e.g., resource not found, duplicate entry, validation failure), always throw an `AppError` with the appropriate HTTP status code (e.g., 404, 409, 400).
    - **Avoid Generic Errors**: Do not throw generic `Error` objects for business rules, as they result in 500 Internal Server Error responses which are confusing for the frontend.
    - **Clean Responses**: Ensure error messages are user-friendly and do not leak internal implementation details (stack traces are handled by the global error handler).

# Documentation Index

The technical details and guidelines for this project have been moved to the `docs/` directory. Please refer to them for specific instructions.

- [Tech Stack](docs/tech_stack.md)
- [Architecture](docs/architecture.md)
- [Coding Conventions](docs/coding_conventions.md)
- [Prisma Model Structure](docs/prisma_model_structure.md)
- [Development Workflow](docs/development_workflow.md)
- [Commit Guidelines](docs/commit_guidelines.md)
- [Database Seeding](docs/seeding.md)

## Quick Summary
- **Architecture**: Modular Clean Architecture (`src/modules/[module_name]`)
