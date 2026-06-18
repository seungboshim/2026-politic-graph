import Link from 'next/link';
import { sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { results } from '@/db/schema';

export const revalidate = 60;

async function participantCount(): Promise<number | null> {
  try { const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(results); return count; } catch { return null; }
}

export default async function Home() {
  const count = await participantCount();
  const grad = { backgroundImage: 'linear-gradient(92deg, #6aa3ff, #b794f6, #ff7b82)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' } as const;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-label01 text-foreground-subtle">18문항 내외 · 3분</p>
      <h1 className="mt-3 max-w-xl text-[2.4rem] font-bold leading-tight tracking-[-0.03em]" style={grad}>나의 정치 유형,<br />그리고 나와 가장 가까운 정치인은?</h1>
      <p className="mt-4 max-w-md text-body01 text-foreground-secondary">좌우 하나의 축으로는 알 수 없는 당신의 진짜 좌표. 13가지 유형 중 당신은 어디에?</p>
      <Link href="/test" data-testid="start" className="mt-8 inline-block rounded-2xl px-10 py-4 text-[1.05rem] font-bold text-background" style={{ backgroundImage: 'linear-gradient(92deg,#2f6fe6,#8b5cf6,#e8434b)' }}>테스트 시작하기</Link>
      {count !== null && count > 0 && <p className="mt-4 font-mono text-label01 text-foreground-faint">지금까지 {count.toLocaleString()}명이 참여했어요</p>}
      <p className="mt-10 max-w-md text-[11px] leading-relaxed text-foreground-faint">결과는 익명으로 저장되며 개인을 식별하는 정보는 수집하지 않습니다. 정치인 매칭은 공개 발언·표결 기록 기반의 참고용 추정입니다.</p>
    </main>
  );
}
