import Link from 'next/link';
import { sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { results } from '@/db/schema';
import { TYPE_MAP } from '@/data/types';
import { POLITICIAN_MAP } from '@/data/politicians';
import SectionHeading from '@/components/ui/SectionHeading';

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
  } catch { return null; }
}

export default async function StatsPage() {
  const stats = await getStats();
  return (
    <main className="mx-auto max-w-[560px] px-[18px] py-12">
      <h1 className="mb-8 text-display02 font-bold tracking-[-0.03em]">전체 통계</h1>
      {!stats || stats.total === 0 ? (
        <p className="text-body02 text-foreground-subtle">아직 집계할 데이터가 없어요.</p>
      ) : (
        <>
          <p className="mb-6 font-mono text-label01 text-foreground-subtle">총 {stats.total.toLocaleString()}명 참여 · 1분마다 갱신</p>
          <section className="mb-10">
            <SectionHeading>유형 분포</SectionHeading>
            {stats.byType.map((r) => {
              const pct = Math.round((r.count / stats.total) * 1000) / 10;
              return (
                <div key={r.typeId} className="mb-2.5">
                  <div className="mb-1 flex justify-between text-body02">
                    <span>{TYPE_MAP[r.typeId]?.name ?? r.typeId}</span>
                    <span className="text-foreground-subtle">{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-raised">
                    <div className="h-full rounded-full bg-spectrum-violet" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </section>
          <section>
            <SectionHeading>가장 많이 매칭된 정치인 (1위 기준)</SectionHeading>
            <ol className="flex flex-col gap-1 text-body02">
              {stats.byPol.slice(0, 10).map((r, i) => (
                <li key={r.polId ?? i} className="flex justify-between rounded-lg bg-surface-raised px-4 py-2">
                  <span>{i + 1}. {POLITICIAN_MAP[r.polId]?.name ?? '?'}</span>
                  <span className="text-foreground-subtle">{r.count}명</span>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
      <div className="mt-10 text-center">
        <Link href="/test" className="inline-block rounded-xl px-6 py-3 font-bold text-background" style={{ backgroundImage: 'linear-gradient(92deg,#2f6fe6,#8b5cf6,#e8434b)' }}>나도 테스트하기</Link>
      </div>
    </main>
  );
}
