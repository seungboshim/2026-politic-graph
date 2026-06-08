// src/app/test/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { computeResult, estimateTotal, getNextQuestion } from '@/lib/engine';
import { submitTest } from '@/app/actions';
import type { Answer, TestResult } from '@/data/schema';
import ResultView from '@/components/ResultView';

const STORAGE_KEY = 'pg_progress';

export default function TestPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [localResult, setLocalResult] = useState<TestResult | null>(null); // DB 강등 시
  const restored = useRef(false);

  // 새로고침 복원
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setAnswers(JSON.parse(saved));
    } catch { /* 무시 */ }
  }, []);

  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers)); } catch { /* 무시 */ }
  }, [answers]);

  const question = getNextQuestion(answers);

  async function finish(final: Answer[]) {
    setSubmitting(true);
    const res = await submitTest(final);
    sessionStorage.removeItem(STORAGE_KEY);
    if (res.ok) {
      try { localStorage.setItem('pg_result_id', res.id); } catch { /* 무시 */ }
      router.push(`/r/${res.id}`);
    } else {
      setLocalResult(computeResult(final)); // 우아한 강등: 저장 실패해도 결과는 보여줌
      setSubmitting(false);
    }
  }

  function answer(optionIndex: number) {
    const next = [...answers, { questionId: question!.id, optionIndex }];
    if (getNextQuestion(next) === null) void finish(next);
    else setAnswers(next);
  }

  if (localResult) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <p className="mb-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          일시적인 오류로 결과를 저장하지 못했어요. 결과는 아래에서 확인할 수 있지만 링크 공유와 댓글은 불가합니다.
        </p>
        <ResultView typeId={localResult.typeId} state={localResult.state} top={localResult.top} />
      </main>
    );
  }

  if (submitting || !question) {
    return <main className="flex min-h-screen items-center justify-center text-zinc-500">결과 계산 중…</main>;
  }

  const total = estimateTotal(answers);
  const progress = Math.min(99, Math.round((answers.length / total) * 100));

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-10">
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-xs text-zinc-500">
          <span>Q{answers.length + 1}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-zinc-200">
          <div className="h-1.5 rounded-full bg-zinc-900 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <h1 className="mb-8 text-xl font-bold leading-relaxed">{question.text}</h1>

      <div className="flex flex-col gap-3">
        {question.options.map((opt, i) => (
          <button
            key={i}
            data-testid="option"
            onClick={() => answer(i)}
            className="rounded-xl border border-zinc-200 px-5 py-4 text-left transition hover:border-zinc-900 hover:bg-zinc-50"
          >
            {opt.label}
          </button>
        ))}
      </div>

      {answers.length > 0 && (
        <button
          onClick={() => setAnswers(answers.slice(0, -1))}
          className="mt-8 self-start text-sm text-zinc-400 hover:text-zinc-600"
        >
          ← 이전 질문으로
        </button>
      )}
    </main>
  );
}
