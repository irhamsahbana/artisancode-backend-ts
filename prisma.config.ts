import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma',
  migrations: {
    seed: 'ts-node -r tsconfig-paths/register prisma/seeds/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL') ?? '',
  },
});
