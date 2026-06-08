// src/app/r/[id]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getResult } from '@/app/actions';
import { TYPE_MAP } from '@/data/types';
import ResultView from '@/components/ResultView';
import Comments from '@/components/Comments';

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const r = await getResult(id);
  const name = r ? TYPE_MAP[r.typeId]?.name : undefined;
  return {
    title: name ? `나는 "${name}" | 정치성향 테스트` : '정치성향 테스트',
    description: '17문항으로 알아보는 나의 정치 유형과 가장 가까운 정치인',
  };
}

export default async function ResultPage({ params }: Props) {
  const { id } = await params;
  const r = await getResult(id);
  if (!r) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <ResultView typeId={r.typeId} state={r.state} top={r.top} samePct={r.samePct} />
      <div className="mt-10 flex justify-center gap-3">
        <Link href="/test" className="rounded-xl border border-zinc-300 px-5 py-3 text-sm">나도 테스트하기</Link>
        <Link href="/stats" className="rounded-xl border border-zinc-300 px-5 py-3 text-sm">전체 통계 보기</Link>
      </div>
      <Comments resultId={r.id} />
    </main>
  );
}
