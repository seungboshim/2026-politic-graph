// src/app/actions.ts
'use server';

import { eq, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { results } from '@/db/schema';
import { computeResult } from '@/lib/engine';
import { QUESTION_MAP } from '@/data/questions';
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
