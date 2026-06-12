import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma',
  migrations: {
    seed: 'bunx tsx prisma/seeds/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL') ?? '',
  },
});
