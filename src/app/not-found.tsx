// src/app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-zinc-500">결과를 찾을 수 없어요.</p>
      <Link href="/test" className="rounded-xl bg-zinc-900 px-6 py-3 text-white">테스트 하러 가기</Link>
    </main>
  );
}
