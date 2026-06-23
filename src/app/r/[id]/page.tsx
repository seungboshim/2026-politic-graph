// src/app/r/[id]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getResult } from '@/app/actions';
import { TYPE_MAP } from '@/data/types';
import ResultView from '@/components/ResultView';
import Comments from '@/components/Comments';
import ShareButton from '@/components/ShareButton';

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const r = await getResult(id);
  const name = r ? TYPE_MAP[r.typeId]?.name : undefined;
  const title = name ? `나의 정치 유형은 "${name}"` : '나의 정치 유형 결과';
  const description = name
    ? `나의 정치 유형은 "${name}". 나와 가장 가까운 정치인은 누구일까? 18문항 내외로 알아보는 정치성향 테스트.`
    : '18문항 내외로 알아보는 나의 정치 유형과 가장 가까운 정치인.';
  return {
    title,
    description,
    // 개인별 결과 페이지는 색인 제외(공유 OG 카드는 그대로 동작).
    robots: { index: false, follow: true },
    openGraph: { type: 'website', title: `${title} | 정치성향 테스트`, description, url: `/r/${id}` },
    twitter: { card: 'summary_large_image', title: `${title} | 정치성향 테스트`, description },
  };
}

export default async function ResultPage({ params }: Props) {
  const { id } = await params;
  const r = await getResult(id);
  if (!r) notFound();

  return (
    <main className="mx-auto max-w-[560px] px-4 py-12">
      <ResultView typeId={r.typeId} state={r.state} top={r.top} samePct={r.samePct} />
      <div className="mt-10 flex flex-col items-center gap-3">
        <ShareButton typeName={TYPE_MAP[r.typeId]?.name} />
        <div className="flex justify-center gap-3">
          <Link href="/" className="rounded-xl border border-border-strong bg-surface-raised px-5 py-3 text-body02 text-foreground-secondary">나도 테스트하기</Link>
          <Link href="/stats" className="rounded-xl border border-border-strong bg-surface-raised px-5 py-3 text-body02 text-foreground-secondary">전체 통계 보기</Link>
        </div>
      </div>
      <Comments />
    </main>
  );
}
