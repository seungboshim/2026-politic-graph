// src/app/actions.ts
'use server';

import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { headers } from 'next/headers';
import { and, desc, eq, gt, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { comments, results } from '@/db/schema';
import { computeResult } from '@/lib/engine';
import { QUESTION_MAP } from '@/data/questions';
import { BANNED_WORDS } from '@/data/moderation';
import type { Answer, MatchResult, UserState } from '@/data/schema';

// ── 결과
export async function submitTest(answers: Answer[]): Promise<{ ok: true; id: string } | { ok: false }> {
  try {
    if (!Array.isArray(answers) || answers.length === 0 || answers.length > 30) return { ok: false };
    for (const a of answers) {
      const q = QUESTION_MAP[a.questionId];
      if (!q || !Number.isInteger(a.optionIndex) || !q.options[a.optionIndex]) return { ok: false };
    }
    const r = computeResult(answers); // 서버 재계산 (조작 방지)
    const [row] = await db
      .insert(results)
      .values({ typeId: r.typeId, vector: r.state, topPoliticians: r.top })
      .returning({ id: results.id });
    return { ok: true, id: row.id };
  } catch {
    return { ok: false }; // DB 장애 → 클라이언트가 로컬 결과로 강등
  }
}

export interface StoredResult {
  id: string;
  typeId: string;
  state: UserState;
  top: MatchResult[];
  samePct: number; // 같은 유형 비율 %
}

export async function getResult(id: string): Promise<StoredResult | null> {
  try {
    const [row] = await db.select().from(results).where(eq(results.id, id));
    if (!row) return null;
    const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(results);
    const [{ same }] = await db
      .select({ same: sql<number>`count(*)::int` })
      .from(results)
      .where(eq(results.typeId, row.typeId));
    return {
      id: row.id,
      typeId: row.typeId,
      state: row.vector as UserState,
      top: row.topPoliticians as MatchResult[],
      samePct: total > 0 ? Math.round((same / total) * 1000) / 10 : 100,
    };
  } catch {
    return null;
  }
}

// ── 댓글
const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(pw, salt, 32).toString('hex')}`;
}

function verifyPassword(pw: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const candidate = scryptSync(pw, salt, 32);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

async function clientIpHash(): Promise<string> {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  return sha256(ip + (process.env.IP_SALT ?? ''));
}

export interface CommentView {
  id: string;
  nickname: string;
  body: string;
  createdAt: string;
  badge: { typeName: string; politicianName: string; similarity: number } | null;
}

export async function addComment(input: {
  resultId: string; nickname: string; password: string; body: string;
}): Promise<{ ok: boolean; error?: string }> {
  const nickname = input.nickname.trim();
  const body = input.body.trim();
  if (nickname.length < 1 || nickname.length > 12) return { ok: false, error: '닉네임은 1~12자' };
  if (input.password.length < 4) return { ok: false, error: '비밀번호는 4자 이상' };
  if (body.length < 1 || body.length > 500) return { ok: false, error: '내용은 1~500자' };
  if (BANNED_WORDS.some((w) => body.includes(w) || nickname.includes(w))) {
    return { ok: false, error: '금칙어가 포함되어 있어요' };
  }
  try {
    const [resultRow] = await db.select({ id: results.id }).from(results).where(eq(results.id, input.resultId));
    if (!resultRow) return { ok: false, error: '테스트 결과가 필요해요' };

    const ipHash = await clientIpHash();
    const oneMinAgo = new Date(Date.now() - 60_000);
    const [{ recent }] = await db
      .select({ recent: sql<number>`count(*)::int` })
      .from(comments)
      .where(and(eq(comments.ipHash, ipHash), gt(comments.createdAt, oneMinAgo)));
    if (recent >= 3) return { ok: false, error: '너무 빨라요. 잠시 후 다시 시도해주세요' };

    await db.insert(comments).values({
      resultId: input.resultId, nickname, body,
      passwordHash: hashPassword(input.password), ipHash,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: '일시적인 오류로 댓글을 등록하지 못했어요' };
  }
}

export async function deleteComment(id: string, password: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const [row] = await db.select().from(comments).where(eq(comments.id, id));
    if (!row || row.deleted) return { ok: false, error: '댓글이 없어요' };
    if (!verifyPassword(password, row.passwordHash)) return { ok: false, error: '비밀번호가 달라요' };
    await db.update(comments).set({ deleted: true }).where(eq(comments.id, id));
    return { ok: true };
  } catch {
    return { ok: false, error: '일시적인 오류' };
  }
}

export async function reportComment(id: string): Promise<{ ok: boolean }> {
  try {
    await db.update(comments).set({ reportCount: sql`${comments.reportCount} + 1` }).where(eq(comments.id, id));
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function listComments(): Promise<CommentView[]> {
  try {
    const rows = await db
      .select({
        id: comments.id, nickname: comments.nickname, body: comments.body,
        createdAt: comments.createdAt, typeId: results.typeId, topPoliticians: results.topPoliticians,
      })
      .from(comments)
      .leftJoin(results, eq(comments.resultId, results.id))
      .where(eq(comments.deleted, false))
      .orderBy(desc(comments.createdAt))
      .limit(100);

    const { TYPE_MAP } = await import('@/data/types');
    const { POLITICIAN_MAP } = await import('@/data/politicians');
    return rows.map((r) => {
      const top = (r.topPoliticians as MatchResult[] | null)?.[0];
      const typeName = r.typeId ? TYPE_MAP[r.typeId]?.name : undefined;
      const pol = top ? POLITICIAN_MAP[top.politicianId] : undefined;
      return {
        id: r.id, nickname: r.nickname, body: r.body, createdAt: r.createdAt.toISOString(),
        badge: typeName && pol && top ? { typeName, politicianName: pol.name, similarity: top.similarity } : null,
      };
    });
  } catch {
    return [];
  }
}
