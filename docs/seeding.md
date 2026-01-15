# Database Seeding

This project uses Prisma's seeding functionality to populate the database with initial data for development and testing.

## Seeding Structure

The seeding logic is modularized in `prisma/seeds/` directory. The main entry point is `prisma/seeds/seed.ts`.

### Key Seeders

-   **Roles & Permissions** (`roles.ts`, `permissions.ts`):
    -   Creates permissions first.
    -   Creates master roles (Owner, Super Admin, Admin).
    -   Copies master roles to specific companies and assigns permissions.
    -   **Owner**: Read-only access to their company.
    -   **Super Admin**: Full access to their company (except deleting the company).
    -   **Admin**: Branch-level access.
-   **Users** (`users.ts`):
    -   Creates default users for each role:
        -   `owner` / `password123`
        -   `superadmin` / `password123`
        -   `admin` / `password123`
-   **Companies** (`companies.ts`): Creates the default company "Tola HQ".
-   **Branches** (`branches.ts`): Creates the default branch "Jakarta Branch".

## How to Run Seeds

To seed the database, run:

```bash
npx prisma db seed
```

This command is also automatically run during `npx prisma migrate reset`.

## Adding New Seeds

1.  Create a new seeder file in `prisma/seeds/`.
2.  Export a function that accepts `PrismaClient` and necessary IDs.
3.  Import and call the function in `prisma/seeds/seed.ts`.
