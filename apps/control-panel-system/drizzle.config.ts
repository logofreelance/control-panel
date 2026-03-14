import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
config({ path: '.env' });

export default defineConfig({
  schema: '../../packages/database/src/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
