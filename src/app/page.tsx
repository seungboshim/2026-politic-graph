import Link from 'next/link';
import { sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { results } from '@/db/schema';

export const revalidate = 60;

async function participantCount(): Promise<number | null> {
  try {
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(results);
    return count;
  } catch {
    return null;
  }
}

export default async function Home() {
  const count = await participantCount();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium text-zinc-500">17문항 · 3분</p>
      <h1 className="mt-3 max-w-xl text-4xl font-extrabold leading-tight">
        나의 정치 유형,<br />그리고 나와 가장 가까운 정치인은?
      </h1>
      <p className="mt-4 max-w-md text-zinc-600">
        좌우 하나의 축으로는 알 수 없는 당신의 진짜 좌표. 13가지 유형 중 당신은 어디에?
      </p>
      <Link href="/test" data-testid="start"
        className="mt-8 rounded-2xl bg-zinc-900 px-10 py-4 text-lg font-bold text-white transition hover:bg-zinc-700">
        테스트 시작하기
      </Link>
      {count !== null && count > 0 && (
        <p className="mt-4 text-sm text-zinc-400">지금까지 {count.toLocaleString()}명이 참여했어요</p>
      )}
      <p className="mt-10 max-w-md text-xs leading-relaxed text-zinc-400">
        결과는 익명으로 저장되며 개인을 식별하는 정보는 수집하지 않습니다.
        정치인 매칭은 공개 발언·표결 기록 기반의 참고용 추정입니다.
      </p>
    </main>
  );
}
