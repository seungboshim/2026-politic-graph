// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

// DDL(마이그레이션)은 직결(unpooled) 연결 우선 — pgbouncer 트랜잭션 풀러는 DDL에 부적합.
// Neon=DATABASE_URL_UNPOOLED, Supabase=POSTGRES_URL_NON_POOLING.
const url =
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL;

export default defineConfig({
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: { url: url! },
});
