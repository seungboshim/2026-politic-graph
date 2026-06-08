// src/app/stats/page.tsx
import Link from 'next/link';
import { sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { results } from '@/db/schema';
import { TYPE_MAP } from '@/data/types';
import { POLITICIAN_MAP } from '@/data/politicians';

export const revalidate = 60;

async function getStats() {
  try {
    const byType = await db
      .select({ typeId: results.typeId, count: sql<number>`count(*)::int` })
      .from(results).groupBy(results.typeId).orderBy(sql`count(*) desc`);
    const byPol = await db
      .select({ polId: sql<string>`top_politicians->0->>'politicianId'`, count: sql<number>`count(*)::int` })
      .from(results).groupBy(sql`top_politicians->0->>'politicianId'`).orderBy(sql`count(*) desc`);
    const total = byType.reduce((s, r) => s + r.count, 0);
    return { byType, byPol, total };
  } catch {
    return null;
  }
}

export default async function StatsPage() {
  const stats = await getStats();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-extrabold">전체 통계</h1>
      {!stats || stats.total === 0 ? (
        <p className="text-zinc-500">아직 집계할 데이터가 없어요.</p>
      ) : (
        <>
          <p className="mb-6 text-sm text-zinc-500">총 {stats.total.toLocaleString()}명 참여 · 1분마다 갱신</p>
          <section className="mb-10">
            <h2 className="mb-3 text-lg font-bold">유형 분포</h2>
            {stats.byType.map((r) => {
              const pct = Math.round((r.count / stats.total) * 1000) / 10;
              return (
                <div key={r.typeId} className="mb-2">
                  <div className="mb-0.5 flex justify-between text-sm">
                    <span>{TYPE_MAP[r.typeId]?.name ?? r.typeId}</span><span className="text-zinc-500">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100">
                    <div className="h-2 rounded-full bg-zinc-800" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </section>
          <section>
            <h2 className="mb-3 text-lg font-bold">가장 많이 매칭된 정치인 (1위 기준)</h2>
            <ol className="flex flex-col gap-1 text-sm">
              {stats.byPol.slice(0, 10).map((r, i) => (
                <li key={r.polId ?? i} className="flex justify-between rounded-lg bg-zinc-50 px-4 py-2">
                  <span>{i + 1}. {POLITICIAN_MAP[r.polId]?.name ?? '?'}</span>
                  <span className="text-zinc-500">{r.count}명</span>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
      <div className="mt-10 text-center">
        <Link href="/test" className="rounded-xl bg-zinc-900 px-6 py-3 text-white">나도 테스트하기</Link>
      </div>
    </main>
  );
}
