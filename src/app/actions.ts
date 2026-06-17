// src/app/actions.ts
'use server';

import { createHash } from 'crypto';
import { headers } from 'next/headers';
import { and, desc, eq, gt, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { comments, results } from '@/db/schema';
import { computeResult } from '@/lib/engine';
import { QUESTION_MAP } from '@/data/questions';
import { BANNED_WORDS } from '@/data/moderation';
import type { Answer, AvatarFace, MatchResult, UserState } from '@/data/schema';
import { makeNick } from '@/lib/nick';
import { TYPE_MAP } from '@/data/types';
import { POLITICIAN_MAP } from '@/data/politicians';

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

const ownerHashOf = (token: string) => sha256(token + (process.env.IP_SALT ?? ''));

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
  badge: { face: AvatarFace; party: string; politicianName: string } | null;
}

export async function addComment(
  input: { resultId: string; ownerToken: string; body: string },
): Promise<{ ok: boolean; error?: string }> {
  const body = input.body.trim();
  if (!input.ownerToken || input.ownerToken.length < 6) return { ok: false, error: '잘못된 요청' };
  if (body.length < 1 || body.length > 500) return { ok: false, error: '내용은 1~500자' };
  if (BANNED_WORDS.some((w) => body.includes(w))) return { ok: false, error: '금칙어가 포함되어 있어요' };
  try {
    const [row] = await db.select({ id: results.id, typeId: results.typeId }).from(results).where(eq(results.id, input.resultId));
    if (!row) return { ok: false, error: '테스트 결과가 필요해요' };

    const ipHash = await clientIpHash();
    const oneMinAgo = new Date(Date.now() - 60_000);
    const [{ recent }] = await db
      .select({ recent: sql<number>`count(*)::int` })
      .from(comments)
      .where(and(eq(comments.ipHash, ipHash), gt(comments.createdAt, oneMinAgo)));
    if (recent >= 3) return { ok: false, error: '너무 빨라요. 잠시 후 다시 시도해주세요' };

    const nickLabel = TYPE_MAP[row.typeId]?.nickLabel ?? '시민';
    const nickname = makeNick(nickLabel, input.ownerToken);
    await db.insert(comments).values({
      resultId: input.resultId, nickname, body,
      ownerHash: ownerHashOf(input.ownerToken), ipHash,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: '일시적인 오류로 댓글을 등록하지 못했어요' };
  }
}

export async function deleteComment(id: string, ownerToken: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const [row] = await db.select().from(comments).where(eq(comments.id, id));
    if (!row || row.deleted) return { ok: false, error: '댓글이 없어요' };
    if (row.ownerHash !== ownerHashOf(ownerToken)) return { ok: false, error: '본인 댓글만 삭제할 수 있어요' };
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
        createdAt: comments.createdAt, topPoliticians: results.topPoliticians,
      })
      .from(comments)
      .leftJoin(results, eq(comments.resultId, results.id))
      .where(eq(comments.deleted, false))
      .orderBy(desc(comments.createdAt))
      .limit(100);
    return rows.map((r) => {
      const topId = (r.topPoliticians as MatchResult[] | null)?.[0]?.politicianId;
      const pol = topId ? POLITICIAN_MAP[topId] : undefined;
      return {
        id: r.id, nickname: r.nickname, body: r.body, createdAt: r.createdAt.toISOString(),
        badge: pol ? { face: pol.face, party: pol.party, politicianName: pol.name } : null,
      };
    });
  } catch {
    return [];
  }
}
