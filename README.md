# Artisancode Backend API

A backend REST API built with Hono, Drizzle ORM, and Bun runtime.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Bun |
| Framework | Hono |
| Language | TypeScript (strict mode) |
| ORM | Drizzle ORM |
| Database | PostgreSQL |
| Validation | Zod |
| Logging | Winston |
| Observability | OpenTelemetry |
| Payment | DOKU |
| Storage | AWS S3 |
| Scheduling | node-cron |
| Testing | Bun test runner, Testcontainers |

## Project Structure

```
src/
  __tests__/       # Integration tests (Testcontainers)
  bin/             # CLI / binary entry points
  common/          # Shared utilities
  config/          # App configuration
  contracts/       # Interface contracts / DTOs
  db/              # Database layer (Drizzle schema, migrations)
  entities/        # Domain entities
  integrations/    # External service integrations (DOKU, S3, etc.)
  jobs/            # Scheduled jobs (node-cron)
  models/          # Data models
  modules/         # Feature modules (unit tests live here)
  routes/          # Hono route definitions
  types/           # TypeScript type definitions
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= 1.3
- PostgreSQL

### Setup

```bash
# Install dependencies
bun install

# Copy environment variables and configure
cp .env.example .env

# Run database migrations
bun run drizzle:migrate

# Start development server
bun run dev
```

The server starts at `http://localhost:3002` (configurable via `REST_PORT` in `.env`).

## Available Scripts

| Script | Description |
|---|---|
| `bun run dev` | Start dev server with file watching |
| `bun run build` | Compile TypeScript and resolve path aliases |
| `bun run start` | Run compiled output |
| `bun run test` | Run unit tests (`src/modules/`) |
| `bun run test:integration` | Run integration tests (`src/__tests__/`) |
| `bun run lint` | ESLint with auto-fix |
| `bun run format` | Prettier formatting |
| `bun run lint:fix` | ESLint + Prettier combined |
| `bun run type-check` | TypeScript type checking |
| `bun run drizzle:generate` | Generate Drizzle migration files |
| `bun run drizzle:migrate` | Apply pending migrations |
| `bun run drizzle:studio` | Open Drizzle Studio |
| `bun run drizzle:push` | Push schema directly to DB (dev only) |

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Description |
|---|---|
| `APP_ENV` | `development` or `production` |
| `REST_PORT` | Server port (default: `3002`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `OTEL_ENABLED` | Enable OpenTelemetry (`true`/`false`) |
| `DOKU_CLIENT_ID` | DOKU payment client ID |
| `DOKU_SHARED_KEY` | DOKU payment shared key |

## Linting & Formatting

This project uses **ESLint** (flat config) with `typescript-eslint` strict + stylistic rules and `eslint-plugin-import` for import ordering. **Prettier** handles formatting (no semicolons, single quotes, 100-char width).

A **Husky pre-commit** hook runs `lint-staged`, which applies ESLint auto-fix to staged `.ts` files.
