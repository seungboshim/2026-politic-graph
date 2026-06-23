// src/db/client.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// 런타임은 풀드(pooler) 연결 우선. Neon=DATABASE_URL, Supabase=POSTGRES_URL.
// prepare:false 는 트랜잭션 풀러(pgbouncer) 안전 설정.
const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
const client = postgres(connectionString!, { prepare: false });
export const db = drizzle(client);
