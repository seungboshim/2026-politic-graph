// src/db/schema.ts
import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const results = pgTable('results', {
  id: uuid('id').defaultRandom().primaryKey(),
  typeId: text('type_id').notNull(),
  vector: jsonb('vector').notNull(),                  // UserState
  topPoliticians: jsonb('top_politicians').notNull(), // MatchResult[]
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  resultId: uuid('result_id').references(() => results.id).notNull(),
  nickname: text('nickname').notNull(),
  ownerHash: text('owner_hash').notNull(),
  body: text('body').notNull(),
  ipHash: text('ip_hash').notNull(),
  deleted: boolean('deleted').default(false).notNull(),
  reportCount: integer('report_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
