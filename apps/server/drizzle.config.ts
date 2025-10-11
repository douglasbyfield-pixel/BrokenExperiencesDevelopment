import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: './apps/server/.env' });

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './apps/server/drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: process.env.DATABASE_URL?.includes("supabase.com") 
      ? { rejectUnauthorized: false }
      : false,
  },
});